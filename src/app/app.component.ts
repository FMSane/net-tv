import { Component, NgZone, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Componentes
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { PosterCardComponent } from './components/poster-card/poster-card.component';
import { LibraryComponent } from './components/library/library.component';
import { UpdateModalComponent } from './components/update-modal/update-modal.component';

// Servicios
import { DataService, MediaItem } from './services/data.service';
import { UpdaterService, UpdateInfo } from './services/updater.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    SidebarComponent, HeaderComponent, PosterCardComponent,
    LibraryComponent, UpdateModalComponent
  ],
  template: `
    <div class="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden relative">
      
      <app-sidebar class="flex-shrink-0 h-full z-50"></app-sidebar>

      <div class="flex-1 flex flex-col h-full relative min-w-0">
        <app-header 
          (openSearch)="openSearch()" 
          (openLibrary)="openLibrary()">
        </app-header>

        <div class="flex-1 overflow-hidden relative">
           <router-outlet></router-outlet>
        </div>
      </div>

      <div *ngIf="showExitToast" 
           class="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-full shadow-2xl z-[9999] border border-zinc-600 flex items-center gap-3 animate-bounce-up pointer-events-none">
          <i class="material-icons text-yellow-400">exit_to_app</i>
          <span class="font-bold text-lg">Presiona ATRÁS otra vez para salir</span>
      </div>

      <div *ngIf="showSearch" class="fixed inset-0 bg-slate-950/95 z-[60] flex flex-col p-10 animate-fade-in">
        <div class="flex justify-end mb-4">
           <button (click)="showSearch = false" class="text-4xl text-gray-400 hover:text-white outline-none focus:text-red-500" tabindex="0">&times;</button>
        </div>
        <input 
          #searchInput type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()"
          placeholder="Buscar películas o series..." 
          class="bg-transparent text-5xl font-bold border-b-2 border-slate-700 pb-4 text-white placeholder-slate-600 outline-none focus:border-red-600 w-full mb-10"
          autofocus
          tabindex="0">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto custom-scrollbar pb-10" tabindex="-1">
          <app-poster-card *ngFor="let item of searchResults" [item]="item" tabindex="0"></app-poster-card>
        </div>
      </div>

      <app-library *ngIf="showLibrary" (close)="showLibrary = false"></app-library>
      <app-update-modal *ngIf="updateInfo" [updateInfo]="updateInfo" (confirm)="onInstallUpdate()" (cancel)="updateInfo = null"></app-update-modal>

      <div id="virtual-cursor"
           class="pointer-events-none fixed z-[9999] w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(255,0,0,0.8)]"
           style="transform: translate(-50%, -50%); left: 50%; top: 50%;">
      </div>

    </div>
  `,
  styles: [`
    .animate-bounce-up { animation: fadeInUp 0.3s ease-out; }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  showSearch = false;
  showLibrary = false;
  searchQuery = '';
  searchResults: MediaItem[] = [];
  updateInfo: UpdateInfo | null = null;

  showExitToast = false;
  lastBackPressTime = 0;
  private readonly exitTimeWindow = 2000; 

  // --- VARIABLES DEL PUNTERO ---
  cursorX = window.innerWidth / 2;
  cursorY = window.innerHeight / 2;
  
  // Variables para la aceleración
  baseSpeed = 3;       // Velocidad inicial lenta para toques cortos
  maxSpeed = 15;       // Velocidad máxima al mantener presionado
  acceleration = 0.5;  // Cuánto aumenta la velocidad por cada frame
  currentSpeed = 3;    // Velocidad actual en ejecución

  keysPressed: { [key: string]: boolean } = {};
  animationFrameId: number | null = null;

  constructor(
    private dataService: DataService, 
    private updaterService: UpdaterService,
    private router: Router, 
    private location: Location, 
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.updaterService.updateAvailable$.subscribe(info => this.updateInfo = info);
    setTimeout(() => this.updaterService.checkForUpdate(), 5000);

    App.addListener('backButton', () => {
        this.zone.run(() => { this.handleBackButton(); });
    });

    window.addEventListener('resize', this.centerCursor);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.centerCursor);
    this.stopLoop();
  }

  // --- LÓGICA ORIGINAL ---
  openSearch() {
    this.showSearch = true;
    this.showLibrary = false;
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLElement;
      if(input) input.focus();
    }, 100);
  }

  onSearch() {
    if(this.searchQuery.length > 2) {
        this.dataService.search(this.searchQuery).subscribe(res => this.searchResults = res);
    }
  }

  openLibrary() {
    this.showLibrary = true;
    this.showSearch = false;
  }

  async onInstallUpdate() {
    if (this.updateInfo) {
      await this.updaterService.downloadAndInstall(this.updateInfo.url);
      this.updateInfo = null;
    }
  }

  handleBackButton() {
    if (this.showSearch) { this.showSearch = false; return; }
    if (document.fullscreenElement) return; 
    if (this.router.url !== '/home') { this.router.navigate(['/home']); return; }

    const currentTime = new Date().getTime();
    if (currentTime - this.lastBackPressTime < this.exitTimeWindow) {
        App.exitApp();
    } else {
        this.lastBackPressTime = currentTime;
        this.showToast();
    }
  }

  showToast() {
      this.showExitToast = true;
      setTimeout(() => { this.showExitToast = false; }, 2000);
  }

  // --- LÓGICA DEL PUNTERO VIRTUAL ---
  centerCursor = () => {
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;
    this.updateCursorDOM();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault(); 
      this.keysPressed[key] = true;
      this.startLoop();
    }
    
    if (key === 'Enter') {
      event.preventDefault();
      this.clickElementUnderCursor();
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (this.keysPressed[event.key]) {
      this.keysPressed[event.key] = false;
    }
    if (!this.keysPressed['ArrowUp'] && !this.keysPressed['ArrowDown'] && 
        !this.keysPressed['ArrowLeft'] && !this.keysPressed['ArrowRight']) {
      this.stopLoop();
    }
  }

  startLoop() {
    if (this.animationFrameId === null) {
      // Reiniciamos la velocidad al empezar a mover
      this.currentSpeed = this.baseSpeed; 

      const loop = () => {
        let moved = false;
        
        // Aplicamos la velocidad actual
        if (this.keysPressed['ArrowUp']) { this.cursorY = Math.max(0, this.cursorY - this.currentSpeed); moved = true; }
        if (this.keysPressed['ArrowDown']) { this.cursorY = Math.min(window.innerHeight, this.cursorY + this.currentSpeed); moved = true; }
        if (this.keysPressed['ArrowLeft']) { this.cursorX = Math.max(0, this.cursorX - this.currentSpeed); moved = true; }
        if (this.keysPressed['ArrowRight']) { this.cursorX = Math.min(window.innerWidth, this.cursorX + this.currentSpeed); moved = true; }

        if (moved) {
          this.updateCursorDOM();
          // Aceleramos para el siguiente frame, hasta llegar a maxSpeed
          if (this.currentSpeed < this.maxSpeed) {
              this.currentSpeed += this.acceleration;
          }
        }
        
        this.animationFrameId = requestAnimationFrame(loop);
      };
      this.animationFrameId = requestAnimationFrame(loop);
    }
  }

  stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  updateCursorDOM() {
    const cursor = document.getElementById('virtual-cursor');
    if (cursor) {
      cursor.style.left = `${this.cursorX}px`;
      cursor.style.top = `${this.cursorY}px`;
    }
  }

  clickElementUnderCursor() {
    const cursor = document.getElementById('virtual-cursor');
    if (cursor) {
        cursor.style.display = 'none'; // Escondemos un milisegundo
    }

    // Obtenemos qué hay exactamente debajo del puntero
    const element = document.elementFromPoint(this.cursorX, this.cursorY) as HTMLElement;

    if (cursor) {
        cursor.style.display = 'block'; // Lo volvemos a mostrar
        
        // EFECTO VISUAL DE CLIC: Hacemos que el puntero se encoja y vuelva a crecer
        cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
        setTimeout(() => cursor.style.transform = 'translate(-50%, -50%) scale(1)', 150);
    }

    if (element) {
      // Buscamos si el elemento tocado está DENTRO de un botón, link o algo clickeable
      const targetToClick = element.closest('button, a, input, [tabindex], .cursor-pointer') as HTMLElement || element;
      
      console.log("👆 Clic virtual ejecutado en:", targetToClick); 
      
      targetToClick.click();
      
      if (targetToClick.tagName === 'INPUT' || targetToClick.tagName === 'TEXTAREA') {
        targetToClick.focus();
      }
    }
  }
}