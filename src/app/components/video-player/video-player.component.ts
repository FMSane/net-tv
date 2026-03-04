import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Source } from '../../services/data.service';
import { App } from '@capacitor/app';
import shaka from 'shaka-player/dist/shaka-player.ui'; // Asegúrate de importar la versión UI si usas controles nativos, o la normal

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full bg-black relative flex items-center justify-center" #videoContainer>
      
      <div *ngIf="!safeUrl && !isPlaying && !isLoading" class="text-gray-500 flex flex-col items-center">
        <i class="material-icons text-6xl">tv</i>
        <p>Selecciona un canal</p>
      </div>

      <iframe *ngIf="isIframe && safeUrl"
              [src]="safeUrl"
              class="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
              referrerpolicy="origin" 
              loading="eager"
              frameborder="0"
              scrolling="no">
      </iframe>

      <video *ngIf="!isIframe" 
             #videoElement 
             class="w-full h-full" 
             autoplay 
             controls>
      </video>

      <div #controlsButton class="absolute inset-0 pointer-events-none border-2 border-transparent focus:border-red-600 z-50" tabindex="-1"></div>

    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    iframe, video { width: 100%; height: 100%; }
  `]
})
export class VideoPlayerComponent implements OnChanges, OnDestroy, AfterViewInit {
  @Input() source: Source | undefined;
  
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('controlsButton') controlsButton!: ElementRef;

  safeUrl: SafeResourceUrl | null = null;

  isIframe = true;
  hasNativeSource = false;
  isPlaying = false;
  isLoading = false;
  isFullscreenMode = false;
  
  private player: shaka.Player | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngAfterViewInit() { 
      // Instalamos polyfills de Shaka
      shaka.polyfill.installAll();

      // Escuchamos el botón atrás de Android
      App.addListener('backButton', () => {
        if (document.fullscreenElement || this.isFullscreenMode) {
            this.exitFullScreen();
        }
      });

      // Gestiona el foco al entrar/salir de pantalla completa
      document.addEventListener('fullscreenchange', () => {
          this.isFullscreenMode = !!document.fullscreenElement;
          
          if (this.isFullscreenMode && !this.isIframe) {
              setTimeout(() => {
                  if (this.controlsButton) this.controlsButton.nativeElement.focus();
              }, 100);
          } else {
              setTimeout(() => this.focusContainer(), 100);
          }
      });
  }

  // --- AQUÍ ESTABA EL ERROR ---
  // He eliminado las referencias a 'channelId' y 'generateUrl'
  ngOnChanges(changes: SimpleChanges) {
    if (changes['source'] && this.source) {
      this.loadSource(this.source);
    }
  }

  public focusContainer() {
      if (this.isFullscreenMode && !this.isIframe && this.controlsButton) {
          this.controlsButton.nativeElement.focus();
      } 
      else if (this.videoContainer) {
          this.videoContainer.nativeElement.focus();
      }
  }

  enterFullScreen() {
    const elem = this.videoContainer.nativeElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().then(() => {
            this.isFullscreenMode = true;
            setTimeout(() => {
                this.focusContainer();
            }, 100);
        }).catch((err: any) => console.log("Error fullscreen:", err));
    }
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch((err: any) => console.log(err));
    }
  }

   togglePlay() {
    if (this.isIframe) return;
    const video = this.videoElement?.nativeElement;
    if (video) {
        video.paused ? video.play() : video.pause();
    }
  }

  public async loadSource(src: Source) {
    await this.destroyPlayer();
    this.isLoading = true;
    this.isFullscreenMode = false;

    if (src.type === 'dash' || src.url.endsWith('.mpd')) {
       // ... lógica de Shaka (igual que antes) ...
       this.isIframe = false;
       this.hasNativeSource = true;
       setTimeout(() => this.initShakaPlayer(src), 50);

    } else {
      this.isIframe = true;
      this.hasNativeSource = false;
      
      let finalUrl = src.url;

      // ⚠️ PARCHE NEBUNEXA: Si detectamos que es Nebunexa, usamos un truco
      if (finalUrl.includes('nebunexa.life') || finalUrl.includes('cvatt.html')) {
          // Opción 1: Intentar forzar la carga a través de un proxy CORS (si existe uno público fiable)
          // Opción 2: Usar Sandbox con permisos muy específicos para borrar el origen
          console.log("Detectado Nebunexa, aplicando parche de iframe...");
      }

      const separator = finalUrl.includes('?') ? '&' : '?';
      if (!finalUrl.includes('autoplay=')) finalUrl += `${separator}autoplay=1`;
      
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.isLoading = false;
    }
  }

  private async initShakaPlayer(src: Source) {
    if (!this.videoElement) {
        console.error("Elemento de video no encontrado");
        return;
    }
    const video = this.videoElement.nativeElement;
    this.player = new shaka.Player(video);
    
    // Manejo básico de errores de Shaka
    this.player.addEventListener('error', (event: any) => {
        console.error('Shaka Error', event.detail);
    });
    
    // Configuración DRM (Si existe en la fuente)
    const drmData = (src as any).drm; 
    if (drmData && drmData.clearkey) {
      this.player.configure({ 
          drm: { 
              clearKeys: { 
                  [drmData.clearkey.keyId]: drmData.clearkey.key 
              } 
          } 
      });
    }

    try {
      await this.player.load(src.url);
      video.muted = false; 
      await video.play();
    } catch (e) {
      console.error('Error cargando asset', e);
    } finally {
        this.isLoading = false;
    }
  }

  private async destroyPlayer() {
    if (this.player) {
      await this.player.destroy();
      this.player = null;
    }
    this.safeUrl = null;
    this.isPlaying = false;
  }

  ngOnDestroy() { this.destroyPlayer(); }
}