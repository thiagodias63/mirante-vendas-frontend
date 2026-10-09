import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MenuComponent],
			imports: [RouterTestingModule, MenubarModule, ToolbarModule],
		}).compileComponents();
		fixture = TestBed.createComponent(MenuComponent);
		fixture.detectChanges();
	});

	it('creates the application menu', () => {
		expect(fixture.componentInstance).toBeTruthy();
		const links = fixture.nativeElement.querySelectorAll('.p-menubar .p-menuitem-link') as NodeListOf<HTMLAnchorElement>;
		expect(links.length).toBe(2);
		expect(links[0].textContent).toContain('Dashboard');
		expect(links[1].textContent).toContain('Importar CSV');
	});
});
