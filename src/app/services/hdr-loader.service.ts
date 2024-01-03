import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataTexture } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

@Injectable({
  providedIn: 'root'
})
export class HdrLoaderService {

  private hdrLoaderSubject = new BehaviorSubject<boolean>(false);
  private hdrTextureSubject = new BehaviorSubject<DataTexture | null>(null);

  getLoaderState() : Observable<boolean> {
    return this.hdrLoaderSubject.asObservable();
  }
  setLoaderState(newState: boolean) {
    this.hdrLoaderSubject.next(newState);
  }

  getHdrTexture() : Observable<DataTexture | null> {
    return this.hdrTextureSubject.asObservable();
  }

  async loadHdr() {
    const loader = new RGBELoader();
    loader.load('assets/textures/big-sky.hdr', (loadedtexture) => {
      if(loadedtexture) {
        this.hdrTextureSubject.next(loadedtexture)
      } else {
        this.hdrTextureSubject.next(null);
      } 
    }, undefined, (error: any) => {
      console.error(error);
  });
  }

  constructor() { }
}
