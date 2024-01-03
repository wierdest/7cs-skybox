import { Component, ElementRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TextService } from '../../services/text.service';

import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


@Component({
  selector: 'app-text-display',
  standalone: true,
  imports: [],
  templateUrl: './text-display.component.html',
  styleUrl: './text-display.component.css'
})
export class TextDisplayComponent {
  value = '';
  private textSubscription!: Subscription;
  private textService = inject(TextService);

  private el = inject(ElementRef);

  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(15, this.el.nativeElement.clientWidth / this.el.nativeElement.clientHeight, 1, 1000);
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private font!: Font;

  private controls!: OrbitControls; // Declare a variable to store the controls

  ngOnInit() {
    const loader = new FontLoader();

    loader.load('assets/fonts/Pacifico_Regular.json', (loadedFont) => {
      if (loadedFont) {
        this.font = loadedFont;
      }
    });

    this.textSubscription = this.textService.getText().subscribe(
      (text) => {
        this.value = text;
        console.log(this.value);
        if (this.font) {
          console.log('got font!');
          this.scene.clear();

          const textGeometry = new TextGeometry(this.value, {
            font: this.font,
            size: 2, // Adjust the size as needed
            height: 0.1, // Adjust the height as needed
            curveSegments: 12,
            bevelEnabled: false,
          });

          textGeometry.center(); // Center the text geometry

          const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 'white' ,// Set the emissive color, such as green
            emissiveIntensity: .5, // Adjust the intensity as needed
            roughness: 0,
            metalness: 0,
          });

          const textMesh = new THREE.Mesh(textGeometry, textMaterial);

          this.scene.add(textMesh);
        }
      }
    );
  }

  ngOnDestroy() {
    this.textSubscription?.unsubscribe();
  }

  ngAfterViewInit() {
    const container = this.el.nativeElement.querySelector('div');
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.renderer.setClearColor(0xFFFFFF, 0);

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.position.set(0, 0, 5); // Adjust the camera position
    this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Point the camera at the origin
    this.camera.updateProjectionMatrix();

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 12);
    directionalLight.position.set(0, 0, 1);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xFFFFFF, 1, 2);
    pointLight.position.set(0, 0, 10); // Adjust the position as needed
    this.scene.add(pointLight);

    // Create OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    this.renderScene();
  }

  private renderScene() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
