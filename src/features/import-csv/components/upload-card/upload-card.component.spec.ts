import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadCardComponent } from './upload-card.component';

describe('UploadCardComponent', () => {
	let fixture: ComponentFixture<UploadCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({ declarations: [UploadCardComponent] }).compileComponents();
		fixture = TestBed.createComponent(UploadCardComponent);
	});

	it('should renders the import heading and labelled card', () => {
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('Importar vendas');
		expect(fixture.nativeElement.querySelector('section[aria-labelledby="page-title"]')).toBeTruthy();
	});
});
