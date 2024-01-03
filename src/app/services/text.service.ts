import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextService {

  private textInputSubject = new BehaviorSubject<string>('');

  setText(newText: string) {
    this.textInputSubject.next(newText);
  }

  getText() : Observable<string> {
    return this.textInputSubject.asObservable();
  }

  constructor() { }
}
