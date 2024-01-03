import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private createTokenSuject = new BehaviorSubject<boolean>(false);

  getTokenCreationValue() : Observable<boolean> {
    return this.createTokenSuject.asObservable();
  }

  setTokenCreationValue(value: boolean) {
    this.createTokenSuject.next(value);
  }

  constructor() { }
}
