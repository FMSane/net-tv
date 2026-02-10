import { Component, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #videoContainer
      class="relative w-full h-full bg-black rounded-xl overflow-hidden group outline-none transition-all"
      [class.focus-ring]="isFocused"
      tabindex="0"
      (focus)="isFocused = true"
      (blur)="isFocused = false"
      (keydown.enter)="toggleFullScreen()"
      (click)="toggleFullScreen()">

      <ng-container *ngIf="safeUrl; else emptyState">
        <iframe
          [src]="safeUrl"
          class="w-full h-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          loading="lazy">
        </iframe>

        <div class="absolute inset-0 z-10 bg-transparent cursor-pointer"></div>
      </ng-container>

      <ng-template #emptyState>
        <div class="flex flex-col items-center justify-center h-full text-gray-500">
           <i class="material-icons text-6xl mb-2">tv_off</i>
           <p>Cargando señal...</p>
        </div>
      </ng-template>

    </div>
  `,
  styles: [`
    /* Estilo visual para cuando el foco está en el video */
    .focus-ring {
      box-shadow: 0 0 0 4px #dc2626; /* Anillo rojo de Tailwind (red-600) */
      z-index: 20;
    }
  `]
})
export class VideoPlayerComponent implements OnChanges {
  @Input() channelId: string | number = '';

  @ViewChild('videoContainer') videoContainer!: ElementRef;

  safeUrl: SafeResourceUrl | null = null;
  isFocused = false;
  isFullScreen = false;

  // URL Base del proveedor externo
  private baseUrl = 'https://www.nebunexa.life/cvatt.html';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['channelId'] && this.channelId) {
      this.generateUrl(this.channelId.toString());
    }
  }

  private generateUrl(id: string) {
    // 1. Codificar en Base64 si no lo está (el sitio externo lo requiere)
    const encodedId = this.isBase64(id) ? id : btoa(id);

    // 2. Construir URL con autoplay forzado
    const fullUrl = `${this.baseUrl}?get=${encodedId}&lang=1&start=true`;

    // 3. Sanitizar para que Angular confíe en la URL
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  toggleFullScreen() {
    const elem = this.videoContainer.nativeElement;

    if (!document.fullscreenElement) {
      // Entrar en pantalla completa
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari/Old Chrome */
        elem.webkitRequestFullscreen();
      }
      this.isFullScreen = true;
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isFullScreen = false;
    }
  }

  private isBase64(str: string) {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }
}
