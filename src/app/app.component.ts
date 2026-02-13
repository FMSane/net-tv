import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; // <--- AGREGADO Location AQUÍ
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
export class AppComponent implements OnInit {
  showSearch = false;
  showLibrary = false;
  searchQuery = '';
  searchResults: MediaItem[] = [];
  updateInfo: UpdateInfo | null = null;

  showExitToast = false;
  lastBackPressTime = 0;
  private readonly exitTimeWindow = 2000; 

  constructor(
    private dataService: DataService, 
    private updaterService: UpdaterService,
    private router: Router, 
    private location: Location, // Ya está importado correctamente arriba
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.updaterService.updateAvailable$.subscribe(info => this.updateInfo = info);
    // Chequear updates tras 5 seg
    setTimeout(() => this.updaterService.checkForUpdate(), 5000);

    // Escucha GLOBAL del botón físico "Atrás"
    App.addListener('backButton', () => {
        this.zone.run(() => {
            this.handleBackButton();
        });
    });
  }

  // ... (Resto de métodos openSearch, onSearch, openLibrary, onInstallUpdate iguales) ...

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
    // 1. Si hay modal de búsqueda abierto, lo cerramos primero
    if (this.showSearch) {
        this.showSearch = false;
        return;
    }

    // 2. Si hay fullscreen, no hacemos nada (VideoPlayer lo maneja)
    if (document.fullscreenElement) {
        return; 
    }

    // 3. Si no estamos en Home, volver
    if (this.router.url !== '/home') {
        this.router.navigate(['/home']);
        return;
    }

    // 4. Salir de la App (Doble confirmación)
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
      setTimeout(() => {
          this.showExitToast = false;
      }, 2000);
  }
}