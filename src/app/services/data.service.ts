import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';

// --- 1. INTERFACES DEL BACKEND (Exactas a Go) ---
export interface Source {
  name: string;
  url: string;
  type: string; // "iframe", "m3u8", "dash"
  priority: number;
  headers?: { [key: string]: string };
  drm?: {
    clearkey?: {
      keyId: string;
      key: string;
    }
  };
}

export interface Channel {
  id?: string;      // Mongo ID
  name: string;
  category: string;
  logo: string;
  sources: Source[];
  last_updated?: string;
}

export interface SportEvent {
  title: string;
  time: string;
  league: string;
  image?: string;
  channels: {
    name: string;
    url: string;
    type: string;
    drm?: any;
    is_external: boolean;
  }[];
}

// --- 2. INTERFAZ GENÉRICA PARA LA UI (Cards, Library, Gallery) ---
export interface MediaItem {
  id: string;
  title: string;
  image: string;
  type: 'movie' | 'series' | 'channel';
  category: string;
  description?: string;
  // Guardamos el objeto original para cuando necesitemos los sources
  originalData?: Channel | any; 
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private apiUrl = 'https://net-tv-back.onrender.com/api';

  // Observables de estado
  public favChannels$ = new BehaviorSubject<MediaItem[]>([]);
  public history$ = new BehaviorSubject<MediaItem[]>([]);
  public watchlistMovies$ = new BehaviorSubject<MediaItem[]>([]);
  public watchlistSeries$ = new BehaviorSubject<MediaItem[]>([]);

  private readonly KEYS = {
    HISTORY: 'tv_app_history',
    FAV_CHANNELS: 'tv_app_fav_channels',
    LAST_CHANNEL: 'tv_app_last_viewed',
    WATCHLIST_MOVIES: 'tv_app_watchlist_movies',
    WATCHLIST_SERIES: 'tv_app_watchlist_series'
  };

  constructor(private http: HttpClient) {
    this.loadLocalData();
  }

  saveLastChannel(item: MediaItem) {
    localStorage.setItem(this.KEYS.LAST_CHANNEL, JSON.stringify(item));
  }

  getLastChannel(): MediaItem | null {
    const data = localStorage.getItem(this.KEYS.LAST_CHANNEL);
    return data ? JSON.parse(data) : null;
  }

  getChannels(): Observable<MediaItem[]> {
    return this.http.get<Channel[]>(`${this.apiUrl}/tv/channels`).pipe(
      map(channels => {
        const mapped = channels.map(c => ({
          id: c.name,
          title: c.name,
          image: c.logo || 'assets/no-logo.png',
          type: 'channel',
          category: c.category || 'General',
          originalData: c
        } as MediaItem));

        // ORDENAR: Favoritos arriba, luego el resto
        const favIds = this.favChannels$.value.map(f => f.id);
        return mapped.sort((a, b) => {
          const aIsFav = favIds.includes(a.id);
          const bIsFav = favIds.includes(b.id);
          if (aIsFav && !bIsFav) return -1;
          if (!aIsFav && bIsFav) return 1;
          return a.title.localeCompare(b.title);
        });
      })
    );
  }

  // El buscador ahora es funcional con la API
  search(query: string): Observable<MediaItem[]> {
    return this.getChannels().pipe(
      map(items => items.filter(i => 
        i.title.toLowerCase().includes(query.toLowerCase()) || 
        i.category.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  // Obtiene la agenda deportiva (No se mapea a MediaItem, se usa directo)
  getAgenda(): Observable<SportEvent[]> {
    return this.http.get<SportEvent[]>(`${this.apiUrl}/agenda`);
  }

  // --- MÉTODOS DE SOPORTE PARA UI ---
  
  getFeatured() { return this.getChannels(); } // Por ahora featured = canales
  
  // Mocks vacíos para Movies/Series hasta que hagas ese backend
  getMovies() { return of([] as MediaItem[]); }
  getSeries() { return of([] as MediaItem[]); }


  // --- LOCAL STORAGE & GESTIÓN DE LISTAS ---

  private loadLocalData() {
    this.favChannels$.next(this.load(this.KEYS.FAV_CHANNELS));
    this.history$.next(this.load(this.KEYS.HISTORY));
    this.watchlistMovies$.next(this.load(this.KEYS.WATCHLIST_MOVIES));
    this.watchlistSeries$.next(this.load(this.KEYS.WATCHLIST_SERIES));
  }

  private load(key: string): MediaItem[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save(key: string, data: MediaItem[]) {
    localStorage.setItem(key, JSON.stringify(data));
    switch(key) {
      case this.KEYS.FAV_CHANNELS: this.favChannels$.next(data); break;
      case this.KEYS.HISTORY: this.history$.next(data); break;
      // ... otros casos
    }
  }

  toggleFavChannel(item: MediaItem) {
    let list = this.load(this.KEYS.FAV_CHANNELS);
    if (list.find(i => i.id === item.id)) {
      list = list.filter(i => i.id !== item.id);
    } else {
      list.push(item);
    }
    this.save(this.KEYS.FAV_CHANNELS, list);
  }

  isFavChannel(id: string): boolean {
    return this.favChannels$.value.some(i => i.id === id);
  }

  addToHistory(item: MediaItem) {
    let list = this.load(this.KEYS.HISTORY);
    list = list.filter(i => i.id !== item.id);
    list.unshift(item);
    if (list.length > 50) list.pop();
    this.save(this.KEYS.HISTORY, list);
  }
}