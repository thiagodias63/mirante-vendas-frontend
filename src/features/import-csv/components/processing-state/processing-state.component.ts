import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-processing-state',
  templateUrl: './processing-state.component.html',
  styleUrls: ['./processing-state.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingStateComponent {
  @Input() loading = false;
  @Input() sending = false;
}
