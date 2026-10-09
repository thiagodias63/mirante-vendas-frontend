import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
	selector: 'menu-header',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
	readonly items: MenuItem[] = [
		{
			label: 'Dashboard',
			icon: 'pi pi-chart-line',
			routerLink: '/dashboard',
			routerLinkActiveOptions: { exact: true },
		},
		{
			label: 'Importar CSV',
			icon: 'pi pi-upload',
			routerLink: '/importar-csv',
		},
	];
}
