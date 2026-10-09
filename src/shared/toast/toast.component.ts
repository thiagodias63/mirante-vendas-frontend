import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  constructor(private readonly toastService: ToastService) {}

  toast$ = this.toastService.toast$();

  dismissToast() {
    this.toastService.dismissToast();
  }
}
