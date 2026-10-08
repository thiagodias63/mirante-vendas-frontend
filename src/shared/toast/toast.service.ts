import { Injectable } from '@angular/core';
import { Toast } from './toast';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toast = new BehaviorSubject<Toast>(null);

  toast$(): Observable<Toast> {
    return this.toast.asObservable();
  }

  dismissToast(): void {
    this.toast.next(null);
  }

  showToast(title: string, message: string, type: 'success' | 'error'): void {
    this.toast.next({ title, message, type });
  }
}
