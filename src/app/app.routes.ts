import { Route } from '@angular/router';
import { MenuComponent } from 'src/features/menu/pages/menu/menu.component';

export const appRoutes: Route[] = [
  // 1. Rota raiz vazia aponta para o MenuComponent
  {
    path: '',
    component: MenuComponent,
    pathMatch: 'full', // Necessário para rotas vazias na raiz
  },
  {
    path: 'importar-csv',
    loadChildren: () =>
      import('../features/import-csv/import-csv.module').then(
        (m) => m.ImportCsvModule
      ),
  },
  // 2. Rota coringa (Fallback) para URLs inválidas (404) -> redireciona para a raiz ('')
  {
    path: '**',
    redirectTo: 'importar-csv',
  },
];
