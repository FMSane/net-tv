import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { AgendaComponent } from './pages/agenda/agenda.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'movies', component: GalleryComponent }, // Reusa el componente
  { path: 'series', component: GalleryComponent }, // Reusa el componente
];
