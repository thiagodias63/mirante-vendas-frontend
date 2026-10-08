import { Route } from '@angular/router';

export const appRoutes: Route[] = [
	{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
	{
		path: 'dashboard',
		loadChildren: () =>
			import('../features/dashboard/dashboard.module').then(
				(module) => module.DashboardModule,
			),
	},
	{
		path: 'importar-csv',
		loadChildren: () =>
			import('../features/import-csv/import-csv.module').then(
				(module) => module.ImportCsvModule,
			),
	},
	{ path: '**', redirectTo: 'dashboard' },
];
