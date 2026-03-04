import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { from, map, Observable, of, catchError } from 'rxjs';

export interface ResolvedStream {
  url: string;
  type: 'm3u8' | 'dash';
  headers?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ResolverService {

  private BASE_DOMAIN = 'https://tvlibree.com';

  constructor() { }

  resolveUrl(iframeUrl: string): Observable<ResolvedStream | null> {
    let targetUrl = iframeUrl;

    // 1. Convertir relativa a absoluta
    if (targetUrl.startsWith('/')) {
        targetUrl = this.BASE_DOMAIN + targetUrl;
    }

    // 2. Decodificar Base64 (?r=...)
    if (targetUrl.includes('?r=')) {
        try {
            const split = targetUrl.split('?r=');
            if (split[1]) {
                targetUrl = atob(split[1]); 
                console.log('🔓 URL Desencriptada:', targetUrl);
            }
        } catch (e) {
            console.error('Error decodificando:', e);
        }
    }

    // 3. Petición HTTP a la URL Final (StreamTP)
    const options = {
      url: targetUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://tvlibree.com/', // StreamTP requiere que vengas de TvLibree
      }
    };

    return from(CapacitorHttp.get(options)).pipe(
      map((response: HttpResponse) => {
        const html = response.data || "";

        // --- BÚSQUEDA 1: Variable JavaScript (StreamTP / Clappr) ---
        // Busca: var playbackURL = "https://..."
        const regexVar = /var\s+playbackURL\s*=\s*["']([^"']+)["']/i;
        let match = html.match(regexVar);

        // --- BÚSQUEDA 2: Etiqueta Source (VideoJS / HTML5) ---
        // Busca: <source src="https://..."
        if (!match) {
           const regexSource = /<source[^>]+src=["']([^"']+\.m3u8[^"']*)["']/i;
           match = html.match(regexSource);
        }

        // --- BÚSQUEDA 3: Genérica (Cualquier http...m3u8) ---
        if (!match) {
           const regexGeneric = /(https?:\/\/[^"']+\.m3u8[^"']*)/i;
           match = html.match(regexGeneric);
        }

        if (match && match[1]) {
          let videoUrl = match[1];
          videoUrl = videoUrl.replace(/\\\//g, '/'); // Limpiar escapes
          
          console.log('✅ VIDEO NATIVO ENCONTRADO:', videoUrl);

          return {
            url: videoUrl,
            type: 'm3u8',
            headers: {
              // IMPORTANTE: Para StreamTP, el referer suele ser la misma URL del iframe o TvLibree
              'Referer': 'https://tvlibree.com/', 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          } as ResolvedStream;
        } 
        
        console.warn('⚠️ No se encontró video nativo en:', targetUrl);
        return null; 
      }),
      catchError(err => {
        console.error('❌ Error HTTP:', err);
        return of(null);
      })
    );
  }
}