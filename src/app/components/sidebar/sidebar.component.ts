import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="h-screen w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-6 z-20">
      <div class="px-6 mb-10">
        <h1 class="text-2xl font-bold text-red-600 hidden md:block">NETTV</h1>
        <span class="text-2xl font-bold text-red-600 md:hidden">N</span>
      </div>

      <nav class="flex-1 flex flex-col gap-2 px-2">
        <a *ngFor="let link of links"
           [routerLink]="link.path"
           routerLinkActive="bg-red-600 text-white shadow-lg scale-105"
           class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:bg-red-600 focus:text-white outline-none"
           tabindex="0">
           <i class="material-icons text-xl">{{link.icon}}</i>
           <span class="font-medium hidden md:block">{{link.name}}</span>
        </a>
      </nav>

      <div class="px-6 text-xs text-slate-600 hidden md:block">
        v1.0 TV App
      </div>
    </aside>
  `,
  styles: [`
    /* Importar íconos de google en index.html si no están */
  `]
})
export class SidebarComponent {
  links = [
    { name: 'Inicio', path: '/home', icon: 'home' },
    { name: 'Explorar', path: '/gallery', icon: 'grid_view' },
    { name: 'Películas', path: '/movies', icon: 'movie' },
    { name: 'Series', path: '/series', icon: 'tv' }
  ];
}
