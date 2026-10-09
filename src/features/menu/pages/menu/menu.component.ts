import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	selector: 'app-menu-header',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {}
