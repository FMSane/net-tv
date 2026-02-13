import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { BehaviorSubject } from 'rxjs';
import { Capacitor } from '@capacitor/core';

export interface UpdateInfo {
  version: string;
  url: string;
  changelog: string;
}

@Injectable({ providedIn: 'root' })
export class UpdaterService {
  // Cambia esto por tu URL real de GitHub RAW
  private updateUrl = 'https://raw.githubusercontent.com/FMSane/net-tv/refs/heads/main/version.json';

  // Observable: Aquí avisaremos si hay actualización
  public updateAvailable$ = new BehaviorSubject<UpdateInfo | null>(null);

  constructor(private http: HttpClient) {}

  async checkForUpdate() {

    // SI NO ES NATIVO (Es web), NO HAGAS NADA
    if (!Capacitor.isNativePlatform()) {
      console.log('Modo Web detectado: Updater desactivado.');
      return;
    }

    try {
      const appInfo = await App.getInfo();
      const currentVersion = appInfo.version; // Ej: "1.0.0"

      this.http.get<any>(this.updateUrl).subscribe(async (remote) => {
        // Comparamos versiones
        if (this.compareVersions(remote.version, currentVersion) > 0) {
          console.log('Actualización encontrada:', remote);
          // ¡Avisamos a la app!
          this.updateAvailable$.next({
            version: remote.version,
            url: remote.url,
            changelog: remote.changelog
          });
        }
      });
    } catch (error) {
      console.error('Error verificando actualización', error);
    }
  }

  // Descarga e instala
  async downloadAndInstall(url: string) {
    try {
      const download = await Filesystem.downloadFile({
        path: 'update.apk',
        directory: Directory.Cache,
        url: url
      });

      if (download.path) {
        await FileOpener.open({
          filePath: download.path,
          contentType: 'application/vnd.android.package-archive'
        });
      }
    } catch (e) {
      console.error('Error instalando', e);
      throw e; // Lanzamos el error para manejarlo en la UI si queremos
    }
  }

  private compareVersions(v1: string, v2: string) {
    return v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' });
  }
}