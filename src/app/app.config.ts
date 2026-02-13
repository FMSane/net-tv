import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 1. IMPORTA ESTO (Es vital para que funcione Internet en la app)
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // 2. AGREGA ESTO AQUÍ (Arregla el NullInjectorError)
    provideHttpClient(withFetch()),

    // 3. NOTA: He eliminado 'provideClientHydration()'
    // porque tu app ya no usa SSR. Eso elimina el error NG0505.
  ]
};