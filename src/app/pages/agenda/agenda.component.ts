import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, MediaItem, SportEvent } from '../../services/data.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent],
  template: `
    <div class="h-full bg-slate-950 p-6 pb-4 flex flex-col overflow-hidden">
      
      <header class="mb-6 pl-2 border-l-4 border-red-600 flex-shrink-0">
        <h1 class="text-3xl font-bold text-white">Agenda Deportiva</h1>
        <p class="text-slate-400 text-sm">Eventos en vivo y directo</p>
      </header>

      <div class="flex-1 overflow-y-auto custom-scrollbar outline-none space-y-4 pr-2" tabindex="-1">
        
        <div *ngFor="let event of events; let i = index" 
             #eventCard
             class="bg-slate-900 border-2 border-transparent rounded-xl overflow-hidden transition group relative shadow-lg outline-none focus:border-white focus:bg-slate-800 focus:shadow-white/20"
             tabindex="0"
             (click)="toggleEvent(event)"
             (keydown.enter)="toggleEvent(event)">
             
             <div class="p-5 flex items-center justify-between cursor-pointer">
                <div class="flex items-center gap-6 w-full">
                    <div class="flex flex-col items-center justify-center bg-slate-800 w-16 h-16 rounded-lg border border-slate-700 group-focus:bg-red-600 group-focus:text-white transition-colors flex-shrink-0">
                        <span class="text-red-500 group-focus:text-white font-bold text-lg">{{ event.time }}</span>
                        <span class="text-[10px] text-slate-500 group-focus:text-white/80 uppercase">HORA</span>
                    </div>

                    <div *ngIf="event.image" class="w-12 h-12 flex-shrink-0 bg-white/10 rounded-full p-1.5 border border-slate-700 flex items-center justify-center">
                        <img [src]="event.image" class="max-w-full max-h-full object-contain filter drop-shadow-md">
                    </div>
                    
                    <div class="flex-1">
                        <span class="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 block">{{ event.league }}</span>
                        <h3 class="text-white font-bold text-xl leading-tight group-hover:text-red-500 group-focus:text-white transition">{{ event.title }}</h3>
                    </div>
                    
                    <i *ngIf="selectedEvent === event" class="material-icons text-white">expand_less</i>
                </div>
             </div>

             <div *ngIf="selectedEvent === event" class="bg-black/40 border-t border-slate-800 p-6 animate-fade-in">
                <p class="text-xs text-slate-400 mb-4 uppercase font-bold tracking-wider">Selecciona una señal:</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button *ngFor="let ch of event.channels" 
                            (click)="$event.stopPropagation(); openFullScreenVideo(ch)"
                            (keydown.enter)="$event.stopPropagation(); openFullScreenVideo(ch)"
                            tabindex="0"
                            class="flex items-center justify-between px-4 py-3 bg-slate-800 hover:bg-red-600 focus:bg-red-600 text-gray-200 hover:text-white focus:text-white rounded-lg transition border border-slate-700 outline-none focus:ring-4 focus:ring-white">
                        <div class="flex flex-col items-start">
                            <span class="font-medium text-sm">{{ ch.name }}</span>
                            <span class="text-[10px] opacity-60 uppercase">{{ ch.type === 'dash' ? 'Directo HD' : 'Web Link' }}</span>
                        </div>
                        <i class="material-icons text-base">play_circle</i>
                    </button>
                </div>
             </div>
        </div>

        <div *ngIf="events.length === 0 && !loading" class="text-center py-20 text-slate-500">
            <i class="material-icons text-6xl mb-4 opacity-20">event_busy</i>
            <p class="text-lg">No hay eventos programados.</p>
        </div>
        
        <div *ngIf="loading" class="text-center py-20 text-red-500">
            <i class="material-icons text-4xl animate-spin">sync</i>
            <p class="mt-2 text-sm text-slate-400">Cargando...</p>
        </div>
      </div>

      <div *ngIf="activeVideoSrc" class="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          <div class="flex-1 relative">
              <app-video-player [source]="activeVideoSrc"></app-video-player>
          </div>
          <button (click)="closeVideo()" 
                  class="absolute top-6 right-6 bg-red-600 text-white w-12 h-12 rounded-full shadow-2xl hover:bg-red-700 transition flex items-center justify-center z-50 focus:ring-4 ring-white/50 outline-none"
                  autofocus
                  tabindex="0">
              <i class="material-icons text-2xl">close</i>
          </button>
      </div>

    </div>
  `
})
export class AgendaComponent implements OnInit, AfterViewInit {
  @ViewChildren('eventCard') eventCards!: QueryList<ElementRef>;

  events: SportEvent[] = [];
  allChannels: MediaItem[] = [];
  selectedEvent: SportEvent | null = null;
  activeVideoSrc: any | null = null;
  loading = true;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getChannels().subscribe(chans => this.allChannels = chans);
    this.dataService.getAgenda().subscribe({
        next: (data) => { 
            this.events = data; 
            this.loading = false; 
            // Intentar enfocar después de que Angular pinte los datos
            setTimeout(() => this.focusFirstItem(), 500);
        },
        error: () => this.loading = false
    });
  }

  ngAfterViewInit() {
      // También intentamos enfocar al iniciar la vista
      this.eventCards.changes.subscribe(() => {
          this.focusFirstItem();
      });
  }

  focusFirstItem() {
      if (this.eventCards && this.eventCards.first) {
          const firstElement = this.eventCards.first.nativeElement;
          firstElement.focus();
      }
  }

  toggleEvent(event: SportEvent) {
      if (this.selectedEvent === event) this.selectedEvent = null;
      else this.selectedEvent = event;
  }

  openFullScreenVideo(channelOption: any) {
    const stableChannel = this.allChannels.find((c: MediaItem) => 
        c.title.toLowerCase() === channelOption.name.toLowerCase()
    );

    if (stableChannel && stableChannel.originalData.sources.length > 0) {
        this.activeVideoSrc = stableChannel.originalData.sources[0];
    } else {
        this.activeVideoSrc = {
            url: channelOption.url,
            type: channelOption.type || 'iframe',
            drm: channelOption.drm,
            name: channelOption.name
        };
    }
  }

  closeVideo() {
      this.activeVideoSrc = null;
      // Al cerrar video, volver foco a la agenda
      setTimeout(() => this.focusFirstItem(), 200);
  }
}