import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormatNoteComponent } from './format-note.component';

describe('FormatNoteComponent', () => {
	let fixture: ComponentFixture<FormatNoteComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({ declarations: [FormatNoteComponent] }).compileComponents();
		fixture = TestBed.createComponent(FormatNoteComponent);
		fixture.detectChanges();
	});

	it('should shows the required CSV column names', () => {
		const text = fixture.nativeElement.textContent as string;
		expect(text).toContain('id_venda, produto, quantidade, preco_unitario e data_venda');
	});
});
