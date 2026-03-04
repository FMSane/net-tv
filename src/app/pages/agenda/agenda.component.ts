import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, SportEvent } from '../../services/data.service';
import { VideoPlayerComponent } from '../../components/video-player/video-player.component';
import { ResolverService } from '../../services/resolver.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent],
  template: `
    <div class="h-full bg-slate-950 p-6 pb-4 flex flex-col overflow-hidden">
      
      <div *ngIf="activeVideoSrc" class="fixed top-0 left-0 bg-red-600 text-white z-[200] p-2 text-xs max-w-md break-all">
        <p><strong>Intentando reproducir:</strong> {{ activeVideoSrc.name }}</p>
        <p><strong>Tipo:</strong> {{ activeVideoSrc.type }}</p>
        <p><strong>URL:</strong> {{ activeVideoSrc.url }}</p>
      </div>
      
      <header class="mb-6 pl-2 border-l-4 border-red-600 flex-shrink-0">
        <h1 class="text-3xl font-bold text-white">Agenda Deportiva</h1>
        <p class="text-slate-400 text-sm">Eventos en vivo y directo</p>
      </header>

      <div class="flex-1 flex flex-col min-h-0 relative bg-slate-900/50 rounded-xl border border-slate-800">
          
          <button (click)="scrollList('up')" 
                  class="w-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 py-2 flex justify-center border-b border-slate-700 transition-colors outline-none cursor-pointer rounded-t-xl z-10 shrink-0">
              <i class="material-icons text-3xl pointer-events-none">keyboard_arrow_up</i>
          </button>

          <div #agendaListContainer class="flex-1 overflow-y-auto custom-scrollbar outline-none space-y-4 p-4 scroll-smooth" tabindex="-1">
            
            <div *ngFor="let event of events; let i = index" 
                 #eventCard
                 class="bg-slate-900 border-2 border-transparent rounded-xl overflow-hidden transition group relative shadow-lg outline-none focus:border-white focus:bg-slate-800 focus:shadow-white/20"
                 tabindex="0"
                 (click)="toggleEvent(event)"
                 (keydown.enter)="toggleEvent(event)">
                 
                 <div class="p-5 flex items-center justify-between cursor-pointer">
                    <div class="flex items-center gap-6 w-full pointer-events-none">
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
                            <div class="flex flex-col items-start pointer-events-none">
                                <span class="font-medium text-sm">{{ ch.name }}</span>
                                <span class="text-[10px] opacity-60 uppercase">Opción Web</span>
                            </div>
                            <i class="material-icons text-base pointer-events-none">play_circle</i>
                        </button>
                    </div>
                 </div>
            </div>

            <div *ngIf="events.length === 0 && !loading" class="text-center py-20 text-slate-500 pointer-events-none">
                <i class="material-icons text-6xl mb-4 opacity-20">event_busy</i>
                <p class="text-lg">No hay eventos programados.</p>
            </div>
            
            <div *ngIf="loading" class="text-center py-20 text-red-500 pointer-events-none">
                <i class="material-icons text-4xl animate-spin">sync</i>
                <p class="mt-2 text-sm text-slate-400">Cargando...</p>
            </div>
            
          </div>

          <button (click)="scrollList('down')" 
                  class="w-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 py-2 flex justify-center border-t border-slate-700 transition-colors outline-none cursor-pointer rounded-b-xl z-10 shrink-0">
              <i class="material-icons text-3xl pointer-events-none">keyboard_arrow_down</i>
          </button>

      </div>

      <div *ngIf="activeVideoSrc" class="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in">
          <div class="flex-1 relative">
              <app-video-player [source]="activeVideoSrc"></app-video-player>
          </div>
          <button (click)="closeVideo()" 
                  class="absolute top-6 right-6 bg-red-600 text-white w-12 h-12 rounded-full shadow-2xl hover:bg-red-700 transition flex items-center justify-center z-50 focus:ring-4 ring-white/50 outline-none cursor-pointer"
                  autofocus
                  tabindex="0">
              <i class="material-icons text-2xl pointer-events-none">close</i>
          </button>
          
          <div *ngIf="resolving" class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none">
              <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mb-4"></div>
              <p class="text-white font-bold animate-pulse">Obteniendo señal limpia...</p>
          </div>
      </div>

    </div>
  `
})
export class AgendaComponent implements OnInit, AfterViewInit {
  @ViewChildren('eventCard') eventCards!: QueryList<ElementRef>;
  @ViewChild('agendaListContainer') agendaListContainer!: ElementRef; // <--- Referencia al contenedor

  events: SportEvent[] = [];
  selectedEvent: SportEvent | null = null;
  activeVideoSrc: any | null = null;
  loading = true;
  resolving = false;

  constructor(
      private dataService: DataService,
      private resolver: ResolverService 
  ) {}

  ngOnInit() {
    this.dataService.getAgenda().subscribe({
        next: (data) => { 
            this.events = data; 
            this.loading = false; 
            setTimeout(() => this.focusFirstItem(), 500);
        },
        error: () => this.loading = false
    });
  }

  ngAfterViewInit() {
      this.eventCards.changes.subscribe(() => {
          this.focusFirstItem();
      });
  }

  // NUEVA FUNCIÓN DE SCROLL
  scrollList(direction: 'up' | 'down') {
      if (this.agendaListContainer) {
          const scrollAmount = 400; // Ajusta este valor según cuánto quieras que baje
          const container = this.agendaListContainer.nativeElement;
          
          if (direction === 'down') {
              container.scrollTop += scrollAmount;
          } else {
              container.scrollTop -= scrollAmount;
          }
      }
  }

  focusFirstItem() {
      if (this.eventCards && this.eventCards.first) {
          this.eventCards.first.nativeElement.focus();
      }
  }

  toggleEvent(event: SportEvent) {
      if (this.selectedEvent === event) this.selectedEvent = null;
      else this.selectedEvent = event;
  }

  openFullScreenVideo(channelOption: any) {
    this.resolving = true;
    this.activeVideoSrc = { url: '', type: 'loading' }; 

    this.resolver.resolveUrl(channelOption.url).subscribe({
        next: (resolved) => {
            this.resolving = false;
            if (resolved) {
                this.activeVideoSrc = {
                    url: resolved.url,
                    type: resolved.type,
                    headers: resolved.headers, 
                    name: channelOption.name
                };
            } else {
                this.activeVideoSrc = {
                    url: channelOption.url,
                    type: 'iframe',
                    name: channelOption.name
                };
            }
        },
        error: () => {
            this.resolving = false;
            this.activeVideoSrc = { url: channelOption.url, type: 'iframe', name: channelOption.name };
        }
    });
  }

  closeVideo() {
      this.activeVideoSrc = null;
      setTimeout(() => this.focusFirstItem(), 200);
  }
}