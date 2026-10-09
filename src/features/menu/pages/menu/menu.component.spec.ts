import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let fixture: ComponentFixture<MenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MenuComponent],
			imports: [RouterTestingModule],
		}).compileComponents();
		fixture = TestBed.createComponent(MenuComponent);
		fixture.detectChanges();
	});

	it('should creates the application menu', () => {
		expect(fixture.componentInstance).toBeTruthy();
		const links = fixture.nativeElement.querySelectorAll('.app-header__nav a') as NodeListOf<HTMLAnchorElement>;
		expect(links.length).toBe(2);
		expect(links[0].textContent).toContain('Dashboard');
		expect(links[1].textContent).toContain('Importar CSV');
	});
});
