import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToastComponent } from './toast/toast.component';
import { ToastService } from './toast/toast.service';

@NgModule({
  imports: [CommonModule],
  declarations: [ToastComponent],
  exports: [ToastComponent],
})
export class SharedModule {}
