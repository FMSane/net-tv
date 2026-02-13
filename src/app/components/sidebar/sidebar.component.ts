import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside 
      class="h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out z-40 relative shadow-2xl"
      [class.w-64]="isExpanded"
      [class.w-20]="!isExpanded"
      (mouseenter)="isExpanded = true"
      (mouseleave)="isExpanded = false"
      (focusin)="isExpanded = true"
      (focusout)="isExpanded = false">

      <div class="px-0 mb-10 flex justify-center items-center h-10 overflow-hidden">
        <h1 *ngIf="isExpanded" class="text-3xl font-bold text-red-600 tracking-tighter animate-fade-in">NETTV</h1>
        <span *ngIf="!isExpanded" class="text-3xl font-bold text-red-600">N</span>
      </div>

      <nav class="flex-1 flex flex-col gap-3 px-3">
        <a *ngFor="let link of links"
           [routerLink]="link.path"
           routerLinkActive="bg-red-600 text-white shadow-lg"
           class="flex items-center px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:bg-red-600 focus:text-white outline-none group overflow-hidden whitespace-nowrap"
           tabindex="0">
           
           <i class="material-icons text-2xl flex-shrink-0 min-w-[24px] text-center"
              [class.mr-4]="isExpanded"
              [class.mx-auto]="!isExpanded">{{link.icon}}</i>
           
           <span *ngIf="isExpanded" class="font-medium animate-fade-in text-sm">{{link.name}}</span>
        </a>
      </nav>

      <div class="px-6 text-xs text-slate-600 whitespace-nowrap overflow-hidden">
        <span *ngIf="isExpanded">v1.0.2 Stable</span>
      </div>
    </aside>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class SidebarComponent {
  isExpanded = false;

  links = [
    { name: 'Inicio', path: '/home', icon: 'home' },
    { name: 'Agenda Deportiva', path: '/agenda', icon: 'emoji_events' },
    { name: 'Explorar', path: '/gallery', icon: 'grid_view' },
    { name: 'Películas', path: '/movies', icon: 'movie' },
    { name: 'Series', path: '/series', icon: 'tv' }
  ];
}