import { Component, ElementRef, EventEmitter, Input, Output, inject } from '@angular/core';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextService } from '../../services/text.service';
import { Subscription } from 'rxjs';
import { HdrLoaderService } from '../../services/hdr-loader.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-skybox',
  standalone: true,
  imports: [],
  templateUrl: './skybox.component.html',
  styleUrl: './skybox.component.css'
})
export class SkyboxComponent {

  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100 );
  private renderer = new THREE.WebGLRenderer(); // Set alpha to true for a transparent canvas

  private el = inject(ElementRef);

  value = '';
  private font!: Font;

  private textSubscription!: Subscription;
  private textService = inject(TextService);

  private textMesh!: THREE.Mesh;

  private controls!: OrbitControls; // Declare a variable to store the controls
  
  private hdrLoaderStateService = inject(HdrLoaderService);
  @Input() hdrEquirectangularMap: THREE.DataTexture | null = null;

  private tokenSubscription!: Subscription;
  private tokenService = inject(TokenService);

  tokenMeshes: THREE.Mesh[] = []

  private seagullModel: THREE.Object3D<THREE.Object3DEventMap> | null = null; // Property to store the loaded GLTF model
  private seagullAnim: THREE.AnimationClip[] | undefined;
  private seagullMixer: THREE.AnimationMixer | null = null;



  private initScene() {
    const container = this.el.nativeElement.querySelector('div');

    this.renderer.setPixelRatio(window.devicePixelRatio);
    // Set the size of the renderer to match the container's size
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Append the renderer's domElement directly to the container
    container.appendChild(this.renderer.domElement);

    container.style.touchAction = 'none';

    this.camera.position.set( 0, 0, -120);

    // Create OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    this.controls.dampingFactor = 0.25;
    // this.controls.screenSpacePanning = false;
    this.controls.maxPolarAngle = Math.PI / 2;

    // load the seagul model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/models/seagull/scene.gltf', (data) => {
      this.seagullModel = data.scene.children[0];
      this.seagullAnim = data.animations;
      this.seagullMixer = new THREE.AnimationMixer(this.seagullModel);
      if(this.seagullAnim && this.seagullAnim.length > 0) {
        const clip = this.seagullMixer.clipAction(this.seagullAnim[0]);
        clip.play();

      }

      const scaleFactors = new THREE.Vector3(10, 10, 10); // Adjust these values as needed
      this.seagullModel.scale.copy(scaleFactors)

      this.seagullModel.position.set(400, -50, 0);
      

      this.scene.add(this.seagullModel)


    }, undefined, (error: any) => {
      console.error(error);
  });

    window.addEventListener( 'resize', this.onWindowResize );
  }

  private renderScene() {
    const animate = () => {
      requestAnimationFrame(animate);
       // Rotate the entire scene
      if (this.scene) {
        this.scene.rotation.y -= 0.001; // Adjust the rotation speed as needed
      }

      if(this.seagullMixer) {
        this.seagullMixer.update(0.01);
      }

      if(this.seagullModel) {
        this.seagullModel.translateX(-1)
        // Check if the seagull is off-camera
        if (this.isOffCamera(this.seagullModel)) {
          // Reset its position
          this.seagullModel.position.x = 400;
        }
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private isOffCamera(object: THREE.Object3D) {
    // Update the object's matrix world before performing the frustum check
    object.updateMatrixWorld();
  
    // Create a bounding box for the object
    const boundingBox = new THREE.Box3().setFromObject(object);
  
    // Get the camera's frustum
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse));
  
    // Check if the bounding box is outside the frustum
    return !frustum.intersectsBox(boundingBox);
  }


  private onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  private setUpHDRTexture() {
    if(this.hdrEquirectangularMap !== null) {
      this.hdrEquirectangularMap.mapping = THREE.EquirectangularReflectionMapping;
      this.hdrEquirectangularMap.minFilter = THREE.LinearFilter;
      this.hdrEquirectangularMap.magFilter = THREE.LinearFilter;
      this.hdrEquirectangularMap.needsUpdate = true;
      this.scene.background = this.hdrEquirectangularMap;
      this.scene.environment = this.hdrEquirectangularMap;
    } 

  }

  private loadFont() {
    const loader = new FontLoader();
    loader.load('assets/fonts/Pacifico_Regular.json', (loadedFont) => {
      if (loadedFont) {
        this.font = loadedFont;
      }
    });
  }

  ngOnInit() {

    // this.loadHDRTexture()

    this.setUpHDRTexture();
    this.loadFont();

    this.textSubscription = this.textService.getText().subscribe(
      (text) => {
        this.value = text;
        console.log(this.value);
        if (this.font) {
          if (this.textMesh) {
            this.scene.remove(this.textMesh);
          }

          const textGeometry = new TextGeometry(this.value, {
            font: this.font,
            size: 50, // Adjust the size as needed
            height: 25, // Adjust the height as needed
            curveSegments: 24,
            bevelEnabled: false,
          });

          textGeometry.center(); // Center the text geometry

          const textMaterial = new THREE.MeshStandardMaterial( {
            color: 0xffffff,
            metalness: 1,
            roughness: 0,
          } );

          this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
          this.scene.rotation.set(0, 0, 0);
          this.textMesh.lookAt(this.camera.position)
          

          this.scene.add(this.textMesh);
        }
      }
    );

    this.tokenSubscription = this.tokenService.getTokenCreationValue().subscribe(
      (value) => {
        if(value) {
           // Clone the textMesh
          const clone = this.textMesh.clone();

          // Adjust the position of the clone
          // clone.position.x -= 1; // Move to the left

          // add code to move every tokenMesh 100 up
        
          clone.position.y += 100 * (this.tokenMeshes.length + 1); // Move up

          // Store the cloned mesh in the tokenMeshes array
          this.tokenMeshes.push(clone);

          // Add the clone to the scene
          this.scene.add(clone);

          // Remove the original textMesh from the scene
          this.scene.remove(this.textMesh);

          // Clear the text value
          this.textService.setText('');
        }
      }
    )
  }

  ngOnDestroy() {
    this.textSubscription?.unsubscribe();
  }
  ngAfterViewInit() {
    this.initScene();
    this.renderScene();
  }

}
