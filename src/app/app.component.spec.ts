import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SharedModule } from '../shared/shared.module';
import { MenuModule } from '../features/menu/menu.module';

describe('AppComponent', () => {
	let fixture: ComponentFixture<AppComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AppComponent],
			imports: [RouterTestingModule, SharedModule, MenuModule],
		}).compileComponents();
		fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
	});

	it('should creates the root component and renders the router outlet', () => {
		expect(fixture.componentInstance).toBeTruthy();
		expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-menu-header')).toBeTruthy();
		expect(fixture.nativeElement.querySelector('app-toast')).toBeTruthy();
	});
});
