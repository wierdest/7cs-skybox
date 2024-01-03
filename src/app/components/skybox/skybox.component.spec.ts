import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkyboxComponent } from './skybox.component';

describe('SkyboxComponent', () => {
  let component: SkyboxComponent;
  let fixture: ComponentFixture<SkyboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkyboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkyboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
