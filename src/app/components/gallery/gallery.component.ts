import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, MediaItem } from '../../services/data.service';
import { PosterCardComponent } from '../poster-card/poster-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs'; // Importar Observable

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, PosterCardComponent],
  template: `
    <div class="h-screen overflow-y-auto p-8 custom-scrollbar pb-32">
      <h1 class="text-4xl font-bold mb-8 text-white capitalize">{{ title }}</h1>

      <div *ngFor="let cat of categories" class="mb-10">
        <h2 class="text-xl font-semibold text-gray-300 mb-4 px-2 border-l-4 border-red-600 ml-1">{{ cat.name }}</h2>

        <div class="flex gap-4 overflow-x-auto pb-6 pt-2 px-2 scroll-smooth hide-scrollbar">
          <app-poster-card
            *ngFor="let item of cat.items"
            [item]="item"
            (click)="selectItem(item)"
            (keydown.enter)="selectItem(item)"
            tabindex="0">
          </app-poster-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class GalleryComponent implements OnInit {
  title = 'Explorar';
  categories: { name: string, items: MediaItem[] }[] = [];

  constructor(
      private dataService: DataService, 
      private route: ActivatedRoute,
      private router: Router
  ) {}

  ngOnInit() {
    // Obtenemos el segmento de la ruta (movies, series, o nada)
    const path = this.route.snapshot.url[0]?.path;
    
    // IMPORTANTE: Definimos el tipo Observable<MediaItem[]> explícitamente
    let dataObs: Observable<MediaItem[]>;

    if (path === 'movies') {
      this.title = 'Películas';
      dataObs = this.dataService.getMovies();
    } else if (path === 'series') {
      this.title = 'Series de TV';
      dataObs = this.dataService.getSeries();
    } else {
      this.title = 'Canales en Vivo';
      dataObs = this.dataService.getChannels();
    }

    dataObs.subscribe((data: MediaItem[]) => {
      // Usamos Set para categorías únicas
      const uniqueCats = [...new Set(data.map(d => d.category))];
      
      this.categories = uniqueCats.map(categoryName => ({
          name: categoryName,
          items: data.filter(d => d.category === categoryName)
      }));
      
      // Ordenamos categorías alfabéticamente
      this.categories.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  selectItem(item: MediaItem) {
    if (item.type === 'channel') {
        this.dataService.saveLastChannel(item);
        this.router.navigate(['/home']);
    } else {
        console.log('Reproducir peli/serie (Aún no implementado):', item);
        // Aquí podrías navegar a una ruta de detalles: ['/details', item.id]
    }
  }
}