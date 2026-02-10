import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// --- COMPONENTES ---
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PosterCardComponent } from './components/poster-card/poster-card.component';
import { LibraryComponent } from './components/library/library.component';       // <--- NUEVO
import { UpdateModalComponent } from './components/update-modal/update-modal.component'; // <--- NUEVO

// --- SERVICIOS ---
import { DataService, MediaItem } from './services/data.service';
import { UpdaterService, UpdateInfo } from './services/updater.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SidebarComponent,
    PosterCardComponent,
    LibraryComponent,      // <--- Importado
    UpdateModalComponent   // <--- Importado
  ],
  template: `
    <div class="flex h-screen w-screen bg-slate-950 text-white font-sans overflow-hidden">

      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col h-full relative">

        <header class="flex justify-between items-center p-6 absolute top-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
          <div class="text-sm text-gray-400 pointer-events-auto font-medium tracking-wide">
             Bienvenido
          </div>

          <div class="flex gap-4 pointer-events-auto">

            <button (click)="openSearch()"
                    class="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 px-4 py-2 rounded-full backdrop-blur transition outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
                    tabindex="0">
              <i class="material-icons">search</i>
              <span class="hidden md:inline font-bold text-sm">Buscar</span>
            </button>

            <button (click)="openLibrary()"
                    class="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 px-4 py-2 rounded-full backdrop-blur transition outline-none focus:ring-2 focus:ring-red-500 shadow-lg"
                    tabindex="0">
              <i class="material-icons">video_library</i> <span class="hidden md:inline font-bold text-sm">Mi Biblioteca</span>
            </button>
          </div>
        </header>

        <div class="flex-1 pt-0">
           <router-outlet></router-outlet>
        </div>
      </div>

      <div *ngIf="showSearch" class="fixed inset-0 bg-slate-950/95 z-50 flex flex-col p-10 animate-fade-in">
        <div class="flex justify-end mb-4">
           <button (click)="showSearch = false" class="text-4xl text-gray-400 hover:text-white outline-none focus:text-red-500">&times;</button>
        </div>

        <input
          #searchInput
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearch()"
          placeholder="Escribe para buscar..."
          class="bg-transparent text-5xl font-bold border-b-2 border-slate-700 pb-4 text-white placeholder-slate-600 outline-none focus:border-red-600 w-full mb-10 transition-colors"
          autofocus>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 overflow-y-auto custom-scrollbar pb-10">
          <app-poster-card *ngFor="let item of searchResults" [item]="item" tabindex="0"></app-poster-card>
        </div>
      </div>

      <app-library
         *ngIf="showLibrary"
         (close)="showLibrary = false">
      </app-library>

      <app-update-modal
        *ngIf="updateInfo"
        [updateInfo]="updateInfo"
        (confirm)="onInstallUpdate()"
        (cancel)="updateInfo = null">
      </app-update-modal>

    </div>
  `
})
export class AppComponent implements OnInit {
  // Estados de UI
  showSearch = false;
  showLibrary = false; // Reemplaza a showHistory

  // Datos de búsqueda
  searchQuery = '';
  searchResults: MediaItem[] = [];

  // Datos de actualización
  updateInfo: UpdateInfo | null = null;

  constructor(
    private dataService: DataService,
    private updaterService: UpdaterService
  ) {}

  ngOnInit() {
    // 1. Escuchar actualizaciones disponibles
    this.updaterService.updateAvailable$.subscribe(info => {
      this.updateInfo = info; // Muestra el modal automáticamente
    });

    // 2. Verificar actualizaciones al iniciar (con delay)
    setTimeout(() => {
      this.updaterService.checkForUpdate();
    }, 5000);
  }

  // --- MÉTODOS DE BUSCADOR ---
  openSearch() {
    this.showSearch = true;
    this.showLibrary = false;
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLElement;
      if(input) input.focus();
    }, 100);
  }

  onSearch() {
    this.dataService.search(this.searchQuery).subscribe(res => this.searchResults = res);
  }

  // --- MÉTODOS DE BIBLIOTECA ---
  openLibrary() {
    this.showLibrary = true;
    this.showSearch = false;
  }

  // --- MÉTODOS DE ACTUALIZACIÓN ---
  async onInstallUpdate() {
    if (this.updateInfo) {
      // Iniciar descarga e instalación
      await this.updaterService.downloadAndInstall(this.updateInfo.url);
      this.updateInfo = null; // Ocultar modal mientras se procesa
    }
  }
}
