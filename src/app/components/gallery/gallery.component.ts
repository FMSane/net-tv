// src/app/pages/gallery/gallery.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, MediaItem } from '../../services/data.service';
import { PosterCardComponent } from '../poster-card/poster-card.component';
import { ActivatedRoute, Router } from '@angular/router'; // Importar Router

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
    const path = this.route.snapshot.url[0]?.path;
    let dataObs;

    if (path === 'movies') {
      this.title = 'Películas';
      dataObs = this.dataService.getMovies();
    } else if (path === 'series') {
      this.title = 'Series de TV';
      dataObs = this.dataService.getSeries();
    } else {
      // AQUÍ ES DONDE IBA LO QUE PREGUNTABAS
      this.title = 'Canales en Vivo';
      // Obtenemos todos los canales desde Render
      dataObs = this.dataService.getChannels();
    }

    dataObs.subscribe(data => {
      // Si estamos en la vista de Canales, los agrupamos por su categoría real
      if (path !== 'movies' && path !== 'series') {
          // Extraemos categorías únicas de los datos reales
          const uniqueCats = [...new Set(data.map(d => d.category))];
          
          this.categories = uniqueCats.map(categoryName => ({
              name: categoryName,
              items: data.filter(d => d.category === categoryName)
          }));
          
          // Ordenamos categorías alfabéticamente
          this.categories.sort((a, b) => a.name.localeCompare(b.name));

      } else {
          // Lógica mock para pelis/series (por ahora)
          const cats = ['Acción', 'Drama', 'Comedia', 'Suspenso'];
          this.categories = cats.map(c => ({
            name: c,
            items: data.filter(d => d.category === c || Math.random() > 0.5).slice(0, 10)
          }));
      }
    });
  }

  selectItem(item: MediaItem) {
    // Si es un canal, vamos al Home a reproducirlo
    if (item.type === 'channel') {
        // Guardamos como último visto para que el Home lo tome
        this.dataService.saveLastChannel(item);
        this.router.navigate(['/home']);
    } else {
        console.log('Reproducir peli/serie:', item);
    }
  }
}