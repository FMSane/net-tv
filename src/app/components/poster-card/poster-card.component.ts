import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaItem } from '../../services/data.service';

@Component({
  selector: 'app-poster-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="group relative flex-shrink-0 w-40 md:w-48 cursor-pointer transition-transform duration-300 transform focus:scale-110 hover:scale-105"
      tabindex="0">
      <img [src]="item.image" alt="{{item.title}}" class="w-full h-60 object-cover rounded-lg shadow-lg group-focus:ring-4 ring-white">

      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2 rounded-b-lg">
        <h3 class="text-sm font-bold text-white truncate">{{ item.title }}</h3>
        <span class="text-xs text-gray-300">{{ item.type | titlecase }}</span>
      </div>
    </div>
  `,
  styles: []
})
export class PosterCardComponent {
  @Input({ required: true }) item!: MediaItem;
}
