import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, MediaItem, Source } from '../../services/data.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoPlayerComponent],
  template: `
    <div class="flex h-full overflow-hidden bg-slate-950">

      <main class="w-[70%] bg-black relative flex items-center justify-center border-r border-slate-800 p-6">
        
        <div *ngIf="currentItem; else placeholder" class="aspect-video w-full max-w-6xl relative shadow-2xl bg-black rounded-xl overflow-hidden border border-slate-800 flex flex-col">
             
             <div class="flex-1 relative bg-black z-10">
                 <app-video-player #playerComponent [source]="currentSource"></app-video-player>
             </div>

             <div class="h-12 bg-slate-950 border-t border-slate-800 flex items-center justify-end px-4 gap-2 relative z-20">
                <span class="text-xs text-slate-500 mr-auto font-mono pl-2">
                   {{ currentSource?.type | uppercase }} 
                   <span *ngIf="currentSource?.type === 'dash'" class="text-green-500">• LIVE</span>
                </span>
                <button (click)="skipForward()" 
                        class="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition focus:bg-red-600 focus:text-white focus:border-white outline-none"
                        tabindex="0">
                    <span class="text-xs font-bold group-focus:text-white">+10s</span>
                    <i class="material-icons text-lg">forward_10</i>
                </button>
             </div>

             <div class="bg-slate-900 p-4 border-t border-slate-800 flex justify-between items-center z-20 relative">
                <div class="flex items-center gap-4">
                    <img *ngIf="currentItem.image" [src]="currentItem.image" class="h-10 w-10 object-contain rounded-md bg-white/10 p-1">
                    <div>
                        <h2 class="text-xl font-bold text-white leading-none">{{ currentItem.title }}</h2>
                        <span class="text-xs text-red-500 font-bold uppercase">{{ currentItem.category }}</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <div class="relative group" *ngIf="availableSources.length > 1">
                         <button class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm transition focus:ring-4 focus:ring-white focus:bg-red-600 outline-none" tabindex="0">
                            <i class="material-icons text-sm">tune</i>
                            <span>{{ currentSource?.name || 'Opciones' }}</span>
                        </button>
                        <div class="absolute bottom-full right-0 mb-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden hidden group-focus-within:block z-50">
                            <button *ngFor="let src of availableSources" 
                                    (click)="setSource(src)"
                                    class="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white border-b border-slate-700 focus:bg-red-600 outline-none"
                                    tabindex="0">
                                {{ src.name }}
                            </button>
                        </div>
                    </div>
                    
                    <button (click)="toggleFav(currentItem)" 
                            class="p-2 text-white hover:text-yellow-400 transition focus:text-yellow-400 outline-none rounded-full hover:bg-white/10 focus:bg-white/10 focus:ring-4 focus:ring-white"
                            tabindex="0">
                        <i class="material-icons">{{ isFav(currentItem) ? 'star' : 'star_border' }}</i>
                    </button>
                </div>
             </div>
        </div>

        <ng-template #placeholder>
           <div class="text-center text-gray-500">
             <i class="material-icons text-7xl opacity-50">live_tv</i>
             <p class="mt-4 text-xl">Cargando...</p>
           </div>
        </ng-template>
      </main>

      <aside class="w-[30%] bg-slate-900 flex flex-col h-full border-l border-slate-800 shadow-xl z-30">
        
        <div class="p-4 bg-slate-900 shadow-md z-10 flex gap-2">
            <button (click)="focusSearchInput()" 
                    class="p-3 bg-slate-800 text-white rounded-xl border border-slate-700 hover:bg-red-600 focus:bg-red-600 focus:border-white outline-none transition-colors"
                    tabindex="0">
                <i class="material-icons">search</i>
            </button>

            <input #searchInput
                   type="text" 
                   [(ngModel)]="searchText" 
                   placeholder="Buscar..." 
                   class="flex-1 bg-slate-800 text-white p-3 rounded-xl border border-slate-700 outline-none focus:border-red-600 transition-colors"
                   tabindex="-1">
        </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar outline-none" tabindex="-1">
            <div *ngFor="let item of getFilteredList()" 
                 [id]="'channel-' + item.id"
                 (click)="selectChannel(item)"
                 class="p-3 rounded-lg cursor-pointer hover:bg-slate-800 flex items-center gap-3 transition border-2 border-transparent focus:border-white outline-none focus:bg-red-600 focus:text-white group"
                 [class.bg-slate-800]="currentItem?.id === item.id"
                 tabindex="0"
                 (keydown.enter)="selectChannel(item)">
                 
                 <img [src]="item.image" class="w-10 h-10 object-contain opacity-80 group-focus:opacity-100 bg-white/5 rounded p-1">
                 <div class="flex-1 min-w-0">
                     <h4 class="text-gray-200 font-bold text-sm truncate group-focus:text-white">{{ item.title }}</h4>
                     <p class="text-xs text-gray-500 group-focus:text-gray-200">{{ item.category }}</p>
                 </div>
                 <i *ngIf="isFav(item)" class="material-icons text-yellow-500 text-xs">star</i>
            </div>
        </div>
      </aside>

    </div>
  `
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('playerComponent') videoPlayer!: VideoPlayerComponent;
  @ViewChild('searchInput') searchInput!: ElementRef;

  allChannels: MediaItem[] = [];
  currentItem: MediaItem | null = null;
  currentSource: Source | undefined;
  availableSources: Source[] = [];
  searchText = '';

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getChannels().subscribe(data => {
      this.allChannels = data;
      const last = this.dataService.getLastChannel();
      if (last) {
        this.selectChannel(last, false); // false = No enfocar player AÚN, esperamos a AfterViewInit
      } else if (this.allChannels.length > 0) {
        this.selectChannel(this.allChannels[0], false);
      }
    });
  }

  ngAfterViewInit() {
      // FORZAR FOCO AL REPRODUCTOR AL INICIAR LA APP
      // Esto soluciona que "nada tenga el foco" al principio
      setTimeout(() => {
          if (this.videoPlayer) {
              this.videoPlayer.focusContainer();
          }
      }, 1000); // 1 segundo de gracia para que cargue todo el DOM
  }

  getFilteredList() {
      return this.allChannels.filter(c => c.title.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  // Activa el input solo si el usuario pulsó la lupa
  focusSearchInput() {
      if (this.searchInput) {
          this.searchInput.nativeElement.focus();
      }
  }

  selectChannel(item: MediaItem, shouldFocus: boolean = true) {
    // Evitar recarga si es el mismo
    if (this.currentItem?.id === item.id && shouldFocus) {
        this.focusPlayer();
        return;
    }

    this.currentItem = item;
    
    if (item.originalData && item.originalData.sources) {
      this.availableSources = [...item.originalData.sources].sort((a, b) => a.priority - b.priority);
      if (this.availableSources.length > 0) {
        this.setSource(this.availableSources[0]);
      }
    }
    
    this.dataService.saveLastChannel(item);
    this.dataService.addToHistory(item);

    if (shouldFocus) {
        this.focusPlayer();
    }
  }

  setSource(src: Source) { this.currentSource = src; }
  skipForward() { 
      const video = document.querySelector('video');
      if (video) video.currentTime += 10;
  }
  toggleFav(item: MediaItem) { this.dataService.toggleFavChannel(item); }
  isFav(item: MediaItem) { return this.dataService.isFavChannel(item.id); }

  private focusPlayer() {
      // Pequeño delay para asegurar que el DOM se actualizó
      setTimeout(() => {
          if (this.videoPlayer) {
              this.videoPlayer.focusContainer();
          }
      }, 200);
  }
}