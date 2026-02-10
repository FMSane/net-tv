import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateInfo } from '../../services/updater.service';

@Component({
  selector: 'app-update-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">

      <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-purple-600"></div>

        <h2 class="text-3xl font-bold text-white mb-2">¡Nueva versión disponible!</h2>
        <p class="text-xl text-red-400 font-mono mb-6">v{{ updateInfo.version }}</p>

        <div class="bg-slate-800 rounded-lg p-4 mb-8 text-left max-h-40 overflow-y-auto">
          <p class="text-gray-400 text-sm font-bold uppercase mb-2">Novedades:</p>
          <p class="text-white whitespace-pre-line">{{ updateInfo.changelog }}</p>
        </div>

        <div class="flex gap-4 justify-center">
          <button (click)="cancel.emit()"
                  class="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 focus:bg-slate-700 focus:ring-2 focus:ring-slate-500 outline-none transition font-bold"
                  tabindex="0">
            Después
          </button>

          <button (click)="confirm.emit()"
                  class="px-8 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:bg-red-500 focus:ring-4 focus:ring-red-900 outline-none transition font-bold shadow-lg flex items-center gap-2"
                  tabindex="0"
                  autofocus>
            <i class="material-icons">download</i>
            Instalar Ahora
          </button>
        </div>

      </div>
    </div>
  `
})
export class UpdateModalComponent {
  @Input({ required: true }) updateInfo!: UpdateInfo;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
