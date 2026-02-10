import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, MediaItem } from '../../services/data.service';
import { PosterCardComponent } from '../poster-card/poster-card.component';
import { ActivatedRoute } from '@angular/router';

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
            (keydown.enter)="selectItem(item)">
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

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit() {
    // Determinar qué datos cargar según la URL
    const path = this.route.snapshot.url[0]?.path;

    let dataObs;
    if (path === 'movies') {
      this.title = 'Películas';
      dataObs = this.dataService.getMovies();
    } else if (path === 'series') {
      this.title = 'Series de TV';
      dataObs = this.dataService.getSeries();
    } else {
      this.title = 'Tendencias';
      dataObs = this.dataService.getFeatured();
    }

    dataObs.subscribe(data => {
      // Agrupar por categorías simuladas
      const cats = ['Acción', 'Drama', 'Comedia', 'Suspenso'];
      this.categories = cats.map(c => ({
        name: c,
        items: data.filter(d => d.category === c || Math.random() > 0.5).slice(0, 10) // Mock logic
      }));
    });
  }

  selectItem(item: MediaItem) {
    console.log('Ir al detalle o reproducir:', item);
    // Aquí podrías navegar al Home y pasarle el ID
  }
}
