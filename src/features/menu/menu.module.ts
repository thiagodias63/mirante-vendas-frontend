import { NgModule } from '@angular/core';
import { MenuComponent } from './pages/menu/menu.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
	declarations: [MenuComponent],
	imports: [CommonModule, RouterModule, MenubarModule, ToolbarModule],
	exports: [MenuComponent],
})
export class MenuModule {}
