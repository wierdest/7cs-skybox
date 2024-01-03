import { Component, ElementRef, NgZone, Output, Renderer2, ViewContainerRef } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { Subject, Subscription, interval, takeUntil } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { ScreenSizeService } from '../../services/screen-size.service';

import { ToolbarComponent } from '../toolbar/toolbar.component';

import { SessionService } from '../../services/session.service';
import { SkyboxComponent } from '../skybox/skybox.component';
import { TextDisplayComponent } from '../text-display/text-display.component';
import { HdrLoaderService } from '../../services/hdr-loader.service';
import { DataTexture } from 'three/src/textures/DataTexture';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    MatSidenavModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    ToolbarComponent, SkyboxComponent, TextDisplayComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  currentScreenSize: string = '';
  private destroyed = new Subject<void>();

  private sessionSubscription!: Subscription;
  isSessionOn: boolean = false;
  numberOfPlayers: number = 0;
  needsPlayerInteraction: boolean = false;

  private hdrLoaderSubscription!: Subscription;
  finishedLoadingHdrTextureForEnvMap = false;
  canShowSkyBox = false;
  private skyboxDisplayTimer: Subscription | undefined;

  private hdrTextureSubscription!: Subscription;
  @Output() hdrTexture: DataTexture | null = null


  constructor(
    private viewContainer: ViewContainerRef, // lazy load
    private hdrLoaderService: HdrLoaderService,
    private screenSizeService: ScreenSizeService,
    private sessionService: SessionService
  ) {
    this.screenSizeService.currentScreenSize$
      .pipe(takeUntil(this.destroyed))
      .subscribe(size => {
        this.currentScreenSize = size;
        // Do any additional logic based on the screen size change
        // console.log(this.currentScreenSize);
      });
  }


  ngOnInit() {
    this.sessionSubscription = this.sessionService.getCurrentSession().subscribe(
      (session) => {
        if(session != null) {
          this.isSessionOn = session.ongoing;

        }
      }
    );

    this.hdrTextureSubscription = this.hdrLoaderService.getHdrTexture().subscribe(
      (tex) => {
        this.hdrTexture = tex
        this.canShowSkyBox = this.hdrTexture !== null;
      }
    );

    // wait to load the hdr texture

    this.skyboxDisplayTimer = interval(2000)
    .pipe(takeUntil(this.destroyed))
    .subscribe(() => {

      this.hdrLoaderService.loadHdr();
      
      if (this.skyboxDisplayTimer) {
        this.skyboxDisplayTimer.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    this.sessionSubscription?.unsubscribe();
    this.hdrLoaderSubscription?.unsubscribe();
    this.hdrTextureSubscription?.unsubscribe();
  }




}
