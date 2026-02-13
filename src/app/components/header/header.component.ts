import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-black/90 to-transparent z-30 w-full">
      <div class="text-gray-300 font-medium tracking-wide text-sm">
        Bienvenido a <span class="text-red-600 font-bold">NETTV</span>
      </div>

      <div class="flex gap-4">
        <button (click)="openSearch.emit()" 
                class="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-5 py-2 rounded-full backdrop-blur transition-all border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none group" 
                tabindex="0">
          <i class="material-icons text-gray-400 group-focus:text-white">search</i>
          <span class="hidden md:inline font-bold text-sm text-gray-300 group-focus:text-white">Buscar Títulos</span>
        </button>

        <button (click)="openLibrary.emit()" 
                class="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 px-5 py-2 rounded-full backdrop-blur transition-all border border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500 outline-none group" 
                tabindex="0">
          <i class="material-icons text-gray-400 group-focus:text-white">schedule</i>
          <span class="hidden md:inline font-bold text-sm text-gray-300 group-focus:text-white">Mi Biblioteca</span>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Output() openSearch = new EventEmitter<void>();
  @Output() openLibrary = new EventEmitter<void>();
}