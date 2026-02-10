import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Asegúrate de tener tu PosterCardComponent, si no lo tienes, avísame y te lo paso
import { PosterCardComponent } from '../poster-card/poster-card.component';
import { DataService, MediaItem } from '../../services/data.service';

type LibraryTab = 'history' | 'movies' | 'series';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, PosterCardComponent],
  template: `
    <div class="fixed inset-0 bg-slate-950 z-50 flex animate-fade-in text-white font-sans">

      <aside class="w-1/4 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <h2 class="text-2xl font-bold mb-8 flex items-center gap-3 text-red-500">
           <i class="material-icons text-3xl">video_library</i> Mi Biblioteca
        </h2>

        <nav class="space-y-3 flex-1">
          <button (click)="activeTab = 'history'"
                  [class.bg-red-600]="activeTab === 'history'"
                  [class.text-white]="activeTab === 'history'"
                  class="w-full text-left px-5 py-4 rounded-xl flex items-center gap-4 transition-all text-slate-400 hover:bg-slate-800 focus:bg-red-600 focus:text-white outline-none"
                  tabindex="0" autofocus>
            <i class="material-icons">history</i>
            <span class="font-bold text-lg">Historial</span>
          </button>

          <button (click)="activeTab = 'movies'"
                  [class.bg-red-600]="activeTab === 'movies'"
                  [class.text-white]="activeTab === 'movies'"
                  class="w-full text-left px-5 py-4 rounded-xl flex items-center gap-4 transition-all text-slate-400 hover:bg-slate-800 focus:bg-red-600 focus:text-white outline-none"
                  tabindex="0">
            <i class="material-icons">movie</i>
            <span class="font-bold text-lg">Películas</span>
          </button>

          <button (click)="activeTab = 'series'"
                  [class.bg-red-600]="activeTab === 'series'"
                  [class.text-white]="activeTab === 'series'"
                  class="w-full text-left px-5 py-4 rounded-xl flex items-center gap-4 transition-all text-slate-400 hover:bg-slate-800 focus:bg-red-600 focus:text-white outline-none"
                  tabindex="0">
            <i class="material-icons">tv</i>
            <span class="font-bold text-lg">Series</span>
          </button>
        </nav>

        <button (click)="close.emit()"
                class="mt-auto flex items-center gap-2 text-slate-400 hover:text-white px-4 py-3 rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-red-500 outline-none transition"
                tabindex="0">
          <i class="material-icons">arrow_back</i> Volver al Inicio
        </button>
      </aside>

      <main class="w-3/4 p-8 bg-slate-950 overflow-y-auto custom-scrollbar">
        <header class="mb-6 border-b border-slate-800 pb-4">
          <h1 class="text-3xl font-bold capitalize text-white">{{ getTitle() }}</h1>
          <p class="text-slate-500 mt-1">{{ getItems().length }} elementos guardados</p>
        </header>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <app-poster-card
             *ngFor="let item of getItems()"
             [item]="item"
             tabindex="0">
          </app-poster-card>
        </div>

        <div *ngIf="getItems().length === 0" class="flex flex-col items-center justify-center h-64 text-slate-600">
           <i class="material-icons text-6xl mb-4 opacity-30">inbox</i>
           <p class="text-lg">No hay nada en esta lista.</p>
        </div>
      </main>
    </div>
  `
})
export class LibraryComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  activeTab: LibraryTab = 'history';

  history: MediaItem[] = [];
  movies: MediaItem[] = [];
  series: MediaItem[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.history$.subscribe(d => this.history = d);
    this.dataService.watchlistMovies$.subscribe(d => this.movies = d);
    this.dataService.watchlistSeries$.subscribe(d => this.series = d);
  }

  getTitle() {
    if (this.activeTab === 'history') return 'Visto recientemente';
    if (this.activeTab === 'movies') return 'Películas guardadas';
    return 'Series guardadas';
  }

  getItems() {
    switch (this.activeTab) {
      case 'history': return this.history;
      case 'movies': return this.movies;
      case 'series': return this.series;
      default: return [];
    }
  }
}
