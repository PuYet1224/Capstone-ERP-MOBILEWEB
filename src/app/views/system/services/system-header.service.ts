import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemHeaderService {
  public headChange = new BehaviorSubject<any>(null);
  public headObs$ = this.headChange.asObservable();
}
