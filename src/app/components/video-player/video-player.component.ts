import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Source } from '../../services/data.service';
import { App } from '@capacitor/app';
import shaka from 'shaka-player';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      #videoContainer
      class="relative w-full h-full bg-black rounded-xl overflow-hidden group outline-none focus:ring-4 focus:ring-red-600 focus:z-40"
      tabindex="0"
      (keydown.enter)="enterFullScreen()"
      (click)="enterFullScreen()">

      <iframe 
        *ngIf="isIframe && safeUrl"
        [src]="safeUrl" 
        class="w-full h-full border-0 block relative z-10" 
        style="pointer-events: auto;"
        tabindex="-1"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowfullscreen>
      </iframe>

      <video 
        #videoElement
        *ngIf="!isIframe"
        class="w-full h-full pointer-events-none bg-black relative z-10" 
        tabindex="-1"
        playsinline
        (play)="isPlaying = true"
        (pause)="isPlaying = false"
        (waiting)="isLoading = true"
        (playing)="isLoading = false">
      </video>

      <button 
        #controlsButton
        *ngIf="isFullscreenMode && !isIframe"
        class="absolute inset-0 w-full h-full z-50 bg-transparent outline-none border-none cursor-default"
        tabindex="0"
        (click)="togglePlay()"
        (keydown.enter)="togglePlay()"
        (keydown.space)="togglePlay()">
        
        <div *ngIf="!isPlaying" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="bg-black/60 rounded-full p-6 animate-pulse">
                <i class="material-icons text-6xl text-white">play_arrow</i>
            </div>
        </div>
      </button>

      <div *ngIf="isLoading" class="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>

      <div *ngIf="!safeUrl && !hasNativeSource && !isLoading" class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-0 pointer-events-none">
         <i class="material-icons text-6xl mb-2 opacity-50">tv_off</i>
         <p>Cargando señal...</p>
      </div>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
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
      shaka.polyfill.installAll();
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['source'] && this.source) {
      this.loadSource(this.source);
    }
  }

  public focusContainer() {
      // 1. Si estamos en Fullscreen y es un video nativo, forzamos el foco al botón invisible
      if (this.isFullscreenMode && !this.isIframe && this.controlsButton) {
          this.controlsButton.nativeElement.focus();
      } 
      // 2. Si es Iframe o estamos en modo ventana, forzamos el foco al contenedor principal
      else if (this.videoContainer) {
          this.videoContainer.nativeElement.focus();
      }
  }

  enterFullScreen() {
    const elem = this.videoContainer.nativeElement;
    if (elem.requestFullscreen) {
        // Usamos .then() para saber exactamente cuándo terminó la animación de pantalla completa
        elem.requestFullscreen().then(() => {
            this.isFullscreenMode = true; // Forzamos el estado por seguridad
            
            // Le damos 100ms al DOM para que se asiente y disparamos el foco
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

  private async loadSource(src: Source) {
    this.destroyPlayer();
    this.isLoading = true;
    this.isFullscreenMode = false;

    if (src.type === 'dash' || src.url.endsWith('.mpd')) {
      this.isIframe = false;
      this.hasNativeSource = true;
      setTimeout(() => this.initShakaPlayer(src), 50);
    } else {
      this.isIframe = true;
      this.hasNativeSource = false;
      
      let finalUrl = src.url;
      const separator = finalUrl.includes('?') ? '&' : '?';
      if (!finalUrl.includes('autoplay=')) finalUrl += `${separator}autoplay=1`;
      
      // YA NO NECESITAMOS FORZAR EL MUTED=1 GRACIAS A TU MAINACTIVITY.JAVA
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
      this.isLoading = false;
    }
  }

  private async initShakaPlayer(src: Source) {
    if (!this.videoElement) return;
    const video = this.videoElement.nativeElement;
    this.player = new shaka.Player(video);
    this.player.addEventListener('error', () => {});
    
    const drmData = (src as any).drm; 
    if (drmData && drmData.clearkey) {
      this.player.configure({ drm: { clearKeys: { [drmData.clearkey.keyId]: drmData.clearkey.key } } });
    }

    try {
      await this.player.load(src.url);
      
      // INICIA AUTOMÁTICAMENTE CON SONIDO
      video.muted = false; 
      await video.play();
      
    } catch (e) {
      console.error(e);
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