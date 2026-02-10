import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

export interface MediaItem {
  id: string | number;
  title: string;
  image: string;
  description?: string;
  type: 'movie' | 'series' | 'channel'; // Importante para diferenciar
  category: string;
  videoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // --- CLAVES DE LOCAL STORAGE ---
  private readonly KEYS = {
    HISTORY: 'tv_app_history',
    FAV_CHANNELS: 'tv_app_fav_channels',      // Canales (Estrella en Home)
    WATCHLIST_MOVIES: 'tv_app_watchlist_movies', // Para la biblioteca
    WATCHLIST_SERIES: 'tv_app_watchlist_series'  // Para la biblioteca
  };

  // --- OBSERVABLES (Para que la UI se actualice sola) ---
  public history$ = new BehaviorSubject<MediaItem[]>([]);
  public favChannels$ = new BehaviorSubject<MediaItem[]>([]);
  public watchlistMovies$ = new BehaviorSubject<MediaItem[]>([]);
  public watchlistSeries$ = new BehaviorSubject<MediaItem[]>([]);

  // --- DATOS MOCK (Tu generador actual) ---
  private mockData: MediaItem[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    title: `Canal / Título ${i + 1}`,
    image: `https://picsum.photos/300/450?random=${i}`,
    // Asignamos tipos variados para probar
    type: i % 3 === 0 ? 'series' : (i % 2 === 0 ? 'movie' : 'channel'),
    category: ['Acción', 'Drama', 'Comedia', 'Deportes'][i % 4],
    description: 'Descripción simulada del programa o canal...',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
  }));

  constructor() {
    this.loadAll();
  }

  // Carga inicial de todo el storage
  private loadAll() {
    this.history$.next(this.load(this.KEYS.HISTORY));
    this.favChannels$.next(this.load(this.KEYS.FAV_CHANNELS));
    this.watchlistMovies$.next(this.load(this.KEYS.WATCHLIST_MOVIES));
    this.watchlistSeries$.next(this.load(this.KEYS.WATCHLIST_SERIES));
  }

  // --- MÉTODOS DE LECTURA/ESCRITURA GENÉRICOS ---
  private load(key: string): MediaItem[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save(key: string, data: MediaItem[]) {
    localStorage.setItem(key, JSON.stringify(data));
    // Actualizar el Subject correspondiente
    switch(key) {
      case this.KEYS.HISTORY: this.history$.next(data); break;
      case this.KEYS.FAV_CHANNELS: this.favChannels$.next(data); break;
      case this.KEYS.WATCHLIST_MOVIES: this.watchlistMovies$.next(data); break;
      case this.KEYS.WATCHLIST_SERIES: this.watchlistSeries$.next(data); break;
    }
  }

  // --- MÉTODOS PÚBLICOS ---

  getFeatured() { return of(this.mockData); }
  getMovies() { return of(this.mockData.filter(x => x.type === 'movie')); }
  getSeries() { return of(this.mockData.filter(x => x.type === 'series')); }

  // 1. Historial
  addToHistory(item: MediaItem) {
    let list = this.load(this.KEYS.HISTORY);
    list = list.filter(i => i.id !== item.id); // Evitar duplicados
    list.unshift(item); // Poner al inicio
    if (list.length > 50) list.pop(); // Limite
    this.save(this.KEYS.HISTORY, list);
  }

  // 2. Canales Favoritos (Home)
  toggleFavChannel(item: MediaItem) {
    let list = this.load(this.KEYS.FAV_CHANNELS);
    const exists = list.find(i => i.id === item.id);
    if (exists) {
      list = list.filter(i => i.id !== item.id); // Borrar
    } else {
      list.push(item); // Agregar
    }
    this.save(this.KEYS.FAV_CHANNELS, list);
  }

  isFavChannel(id: string | number): boolean {
    return this.favChannels$.value.some(i => i.id === id);
  }

  // 3. Biblioteca (Movies/Series)
  toggleWatchlist(item: MediaItem) {
    const key = item.type === 'movie' ? this.KEYS.WATCHLIST_MOVIES : this.KEYS.WATCHLIST_SERIES;
    let list = this.load(key);
    const exists = list.find(i => i.id === item.id);
    if (exists) list = list.filter(i => i.id !== item.id);
    else list.push(item);
    this.save(key, list);
  }

  search(query: string) {
    const q = query.toLowerCase();
    return of(this.mockData.filter(x => x.title.toLowerCase().includes(q)));
  }
}
