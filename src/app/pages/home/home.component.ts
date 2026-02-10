import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, MediaItem } from '../../services/data.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoPlayerComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-950">

      <main class="w-[70%] bg-black relative flex items-center justify-center border-r border-slate-800">

        <div *ngIf="currentVideo; else placeholder" class="w-full h-full relative group-video">

             <app-video-player [channelId]="currentVideo.id"></app-video-player>

             <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex justify-between items-end transition-opacity duration-300">
                <div class="pointer-events-none">
                   <h2 class="text-3xl font-bold text-white drop-shadow-md">{{ currentVideo.title }}</h2>
                   <p class="text-gray-300 text-sm mt-1">{{ currentVideo.description || 'Sin descripción' }}</p>
                </div>

                <button (click)="toggleFav(currentVideo)"
                        class="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white focus:bg-yellow-500 focus:text-black border border-white/20 transition backdrop-blur-md outline-none"
                        tabindex="0">
                  <i class="material-icons text-2xl">{{ isFav(currentVideo) ? 'star' : 'star_border' }}</i>
                </button>
             </div>
        </div>

        <ng-template #placeholder>
          <div class="text-center text-gray-500">
            <i class="material-icons text-7xl opacity-50">smart_display</i>
            <p class="mt-4 text-xl font-light">Selecciona un canal para comenzar</p>
          </div>
        </ng-template>
      </main>

      <aside class="w-[30%] bg-slate-900 flex flex-col">

        <div class="p-4 border-b border-slate-800 bg-slate-900 z-10 shadow-md flex gap-2">

          <div class="relative flex-1">
            <i class="material-icons absolute left-3 top-3 text-slate-400">search</i>
            <input
              type="text"
              [(ngModel)]="searchText"
              placeholder="Buscar..."
              (focus)="showFavoritesOnly = false"
              class="w-full bg-slate-800 text-white rounded-xl pl-10 pr-4 py-3 border border-slate-700 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder-slate-500"
              tabindex="0">
          </div>

          <button
            (click)="showFavoritesOnly = !showFavoritesOnly"
            [class.text-yellow-400]="showFavoritesOnly"
            [class.bg-slate-700]="showFavoritesOnly"
            class="px-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 focus:bg-slate-700 focus:text-yellow-400 focus:border-yellow-500 outline-none transition-all"
            tabindex="0">
            <i class="material-icons text-2xl">{{ showFavoritesOnly ? 'star' : 'star_border' }}</i>
          </button>
        </div>

        <div class="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50">
           {{ showFavoritesOnly ? 'Favoritos Guardados' : 'Todos los Canales' }}
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">

          <div *ngIf="showFavoritesOnly && favList.length === 0" class="text-center text-slate-500 mt-10 p-4">
             <i class="material-icons text-4xl mb-2">star_border</i>
             <p>No tienes favoritos guardados.</p>
          </div>

          <div *ngFor="let item of getDisplayList()"
               (click)="playVideo(item)"
               (keydown.enter)="playVideo(item)"
               tabindex="0"
               class="p-4 rounded-xl cursor-pointer transition-all duration-200 border border-transparent outline-none group hover:bg-slate-800 focus:bg-slate-800 focus:scale-[1.02] focus:border-l-4 focus:border-l-red-600 focus:shadow-lg relative">

            <div class="flex justify-between items-start mb-1 gap-2">
              <h4 class="font-bold text-slate-300 group-focus:text-white text-lg leading-tight">{{item.title}}</h4>

              <div class="flex items-center gap-2">
                <i *ngIf="isFav(item)" class="material-icons text-yellow-500 text-sm">star</i>

                <span *ngIf="currentVideo?.id === item.id" class="flex h-3 w-3 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
            </div>

            <p class="text-xs text-slate-500 group-focus:text-slate-400 line-clamp-1">{{item.description || 'En vivo'}}</p>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
  `]
})
export class HomeComponent implements OnInit {
  // Listas de datos
  allChannels: MediaItem[] = [];
  favList: MediaItem[] = [];

  // Estado UI
  searchText = '';
  showFavoritesOnly = false;
  currentVideo: MediaItem | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // 1. Cargar lista principal
    this.dataService.getFeatured().subscribe(data => {
      this.allChannels = data;
      // Autoplay si hay datos
      if(this.allChannels.length > 0) this.playVideo(this.allChannels[0]);
    });

    // 2. Suscribirse a cambios en favoritos (para que el botón estrella reaccione al instante)
    this.dataService.favChannels$.subscribe(favs => {
      this.favList = favs;
    });
  }

  // Lógica principal de filtrado
  getDisplayList() {
    if (this.showFavoritesOnly) {
      // Si estamos en modo "Solo Favoritos", ignoramos la búsqueda o buscamos DENTRO de favoritos
      return this.favList.filter(i =>
        i.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    // Si estamos en modo normal
    return this.allChannels.filter(i =>
      i.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  playVideo(item: MediaItem) {
    this.currentVideo = item;
    this.dataService.addToHistory(item);
  }

  toggleFav(item: MediaItem) {
    this.dataService.toggleFavChannel(item);
  }

  isFav(item: MediaItem): boolean {
    return this.dataService.isFavChannel(item.id);
  }
}
