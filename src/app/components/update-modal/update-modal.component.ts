import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateInfo } from '../../services/updater.service';

@Component({
  selector: 'app-update-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">

      <div class="bg-slate-950 border-2 border-slate-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-purple-600"></div>

        <h2 class="text-3xl font-bold text-white mb-2 mt-4">¡Actualización Disponible!</h2>
        <p class="text-xl text-red-500 font-mono mb-6 font-bold">v{{ updateInfo.version }}</p>

        <div class="bg-slate-900 rounded-lg p-4 mb-8 text-left max-h-40 overflow-y-auto border border-slate-800">
          <p class="text-gray-400 text-xs font-bold uppercase mb-2 tracking-widest">NOVEDADES:</p>
          <p class="text-white whitespace-pre-line text-sm">{{ updateInfo.changelog }}</p>
        </div>

        <div class="flex gap-4 justify-center">
          <button (click)="cancel.emit()"
                  class="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 focus:bg-slate-800 focus:border-white outline-none transition font-bold"
                  tabindex="0">
            Ahora no
          </button>

          <button (click)="confirm.emit()"
                  class="px-8 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-4 focus:ring-white/50 outline-none transition font-bold shadow-lg flex items-center gap-2"
                  tabindex="0"
                  autofocus>
            <i class="material-icons">download</i>
            Actualizar
          </button>
        </div>

      </div>
    </div>
`,
})
export class UpdateModalComponent {
  @Input({ required: true }) updateInfo!: UpdateInfo;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
