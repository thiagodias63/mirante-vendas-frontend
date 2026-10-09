import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-upload-card',
  templateUrl: './upload-card.component.html',
  styleUrls: ['./upload-card.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadCardComponent {}
