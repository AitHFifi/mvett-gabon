import * as THREE from 'three';
import gsap from 'gsap';
import type { FlatSlide } from '../data/provinces';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uCurrentTexture;
  uniform sampler2D uNextTexture;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uIntensity;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uCurrentResolution;
  uniform vec2 uNextResolution;
  uniform vec2 uMouse; // Normalized mouse coordinates [-1.0, 1.0]

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Full-screen cover mode with mouse parallax and subtle Ken Burns breathing
  vec2 getCoverUV(vec2 uv, vec2 screenRes, vec2 imageRes, vec2 mouseOffset, float breathe) {
    float screenAspect = screenRes.x / screenRes.y;
    float imageAspect = imageRes.x / imageRes.y;
    
    vec2 scale = vec2(1.0);
    
    if (screenAspect > imageAspect) {
      scale = vec2(1.0, screenAspect / imageAspect);
    } else {
      scale = vec2(imageAspect / screenAspect, 1.0);
    }

    // Apply smooth breathing zoom and subtle mouse parallax
    scale *= breathe;
    vec2 centeredUV = (uv - 0.5 - mouseOffset * 0.018) / scale + 0.5;
    return centeredUV;
  }

  void main() {
    // Continuous subtle breathing zoom (Ken Burns pulse)
    float breathe = 1.0 + sin(uTime * 0.7) * 0.02;
    
    // Transition peak curve
    float waveProgress = sin(uProgress * 3.14159265);
    
    // Multi-layered organic fluid wave noise
    float n1 = noise(vUv * 6.5 + vec2(uTime * 0.35, uProgress * 2.2));
    float n2 = noise(vUv * 15.0 - vec2(uProgress * 3.2, uTime * 0.2));
    float combinedNoise = (n1 * 0.65 + n2 * 0.35) - 0.5;

    // Directional liquid wave
    float wave = sin(vUv.y * 13.0 + uProgress * 6.28318 * uDirection) * 0.04;
    vec2 distortion = vec2(combinedNoise + wave, combinedNoise * 0.8) * waveProgress * uIntensity;

    // Full-bleed UVs
    vec2 uvCurrent = getCoverUV(vUv, uResolution, uCurrentResolution, uMouse, breathe);
    vec2 uvNext = getCoverUV(vUv, uResolution, uNextResolution, uMouse, breathe);

    // Apply liquid distortion
    vec2 displacedUV1 = uvCurrent + distortion * (1.0 - uProgress);
    vec2 displacedUV2 = uvNext - distortion * uProgress;

    // Chromatic aberration (RGB split during transition)
    vec2 chromaOffset = vec2(0.022, 0.008) * waveProgress * uDirection;

    // Sample Current Image with chromatic split
    float r1 = texture2D(uCurrentTexture, displacedUV1 + chromaOffset).r;
    float g1 = texture2D(uCurrentTexture, displacedUV1).g;
    float b1 = texture2D(uCurrentTexture, displacedUV1 - chromaOffset).b;
    vec4 col1 = vec4(r1, g1, b1, 1.0);

    // Sample Next Image with chromatic split
    float r2 = texture2D(uNextTexture, displacedUV2 - chromaOffset).r;
    float g2 = texture2D(uNextTexture, displacedUV2).g;
    float b2 = texture2D(uNextTexture, displacedUV2 + chromaOffset).b;
    vec4 col2 = vec4(r2, g2, b2, 1.0);

    // Smoothstep blend between frames
    vec4 finalColor = mix(col1, col2, smoothstep(0.0, 1.0, uProgress));

    gl_FragColor = finalColor;
  }
`;

export interface WebGLSliderOptions {
  container: HTMLElement;
  slides: FlatSlide[];
  onSlideChange?: (index: number, slide: FlatSlide) => void;
}

export class WebGLSlider {
  private container: HTMLElement;
  private slides: FlatSlide[];
  private currentIndex: number = 0;
  private isTransitioning: boolean = false;
  private onSlideChange?: (index: number, slide: FlatSlide) => void;

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private clock: THREE.Clock;

  private textures: THREE.Texture[] = [];
  private imageDimensions: THREE.Vector2[] = [];
  private animationId: number | null = null;

  // Mouse tracking with smooth lerp
  private targetMouse: THREE.Vector2 = new THREE.Vector2(0, 0);
  private currentMouse: THREE.Vector2 = new THREE.Vector2(0, 0);

  constructor(options: WebGLSliderOptions) {
    this.container = options.container;
    this.slides = options.slides;
    this.onSlideChange = options.onSlideChange;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000);
    this.camera.position.z = 2;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    const placeholderTexture = this.createSolidTexture('#111111');

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: false,
      uniforms: {
        uCurrentTexture: { value: placeholderTexture },
        uNextTexture: { value: placeholderTexture },
        uProgress: { value: 0.0 },
        uDirection: { value: 1.0 },
        uIntensity: { value: 0.9 },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(this.container.clientWidth, this.container.clientHeight) },
        uCurrentResolution: { value: new THREE.Vector2(1920, 1080) },
        uNextResolution: { value: new THREE.Vector2(1920, 1080) },
        uMouse: { value: new THREE.Vector2(0, 0) }
      }
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.preloadTextures().then(() => {
      this.initFirstSlide();
      this.animate();
    });

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onMouseMove(e: MouseEvent): void {
    this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  private createSolidTexture(colorHex: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 2, 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  private async preloadTextures(): Promise<void> {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const promises = this.slides.map((slide, idx) => {
      return new Promise<void>((resolve) => {
        loader.load(
          slide.image,
          (texture) => {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            this.textures[idx] = texture;
            const img = texture.image;
            this.imageDimensions[idx] = new THREE.Vector2(img.width || 1920, img.height || 1080);
            resolve();
          },
          undefined,
          () => {
            const fb = this.createSolidTexture(slide.backgroundColor);
            this.textures[idx] = fb;
            this.imageDimensions[idx] = new THREE.Vector2(1920, 1080);
            resolve();
          }
        );
      });
    });

    await Promise.all(promises);
  }

  private initFirstSlide(): void {
    const firstTexture = this.textures[0];
    const firstDim = this.imageDimensions[0];
    const firstSlide = this.slides[0];

    this.material.uniforms.uCurrentTexture.value = firstTexture;
    this.material.uniforms.uNextTexture.value = firstTexture;
    this.material.uniforms.uCurrentResolution.value = firstDim;
    this.material.uniforms.uNextResolution.value = firstDim;
    this.material.uniforms.uProgress.value = 0.0;

    if (this.onSlideChange) {
      this.onSlideChange(0, firstSlide);
    }
  }

  public goToSlide(nextIndex: number, forward: boolean = true): void {
    if (this.isTransitioning || nextIndex === this.currentIndex) return;
    if (nextIndex < 0) nextIndex = this.slides.length - 1;
    if (nextIndex >= this.slides.length) nextIndex = 0;

    this.isTransitioning = true;
    const direction = forward ? 1.0 : -1.0;
    const nextSlide = this.slides[nextIndex];

    const currentTexture = this.textures[this.currentIndex];
    const nextTexture = this.textures[nextIndex];
    const currentDim = this.imageDimensions[this.currentIndex];
    const nextDim = this.imageDimensions[nextIndex];

    this.material.uniforms.uCurrentTexture.value = currentTexture;
    this.material.uniforms.uNextTexture.value = nextTexture;
    this.material.uniforms.uCurrentResolution.value = currentDim;
    this.material.uniforms.uNextResolution.value = nextDim;
    this.material.uniforms.uDirection.value = direction;
    this.material.uniforms.uProgress.value = 0.0;

    if (this.onSlideChange) {
      this.onSlideChange(nextIndex, nextSlide);
    }

    gsap.to(this.material.uniforms.uProgress, {
      value: 1.0,
      duration: 1.15,
      ease: 'power2.inOut',
      onComplete: () => {
        this.currentIndex = nextIndex;
        this.material.uniforms.uCurrentTexture.value = nextTexture;
        this.material.uniforms.uCurrentResolution.value = nextDim;
        this.material.uniforms.uProgress.value = 0.0;
        this.isTransitioning = false;
      }
    });
  }

  public goToProvince(provinceIndex: number): void {
    const targetSlideIndex = this.slides.findIndex(s => s.provinceIndex === provinceIndex);
    if (targetSlideIndex !== -1 && targetSlideIndex !== this.currentIndex) {
      this.goToSlide(targetSlideIndex, targetSlideIndex > this.currentIndex);
    }
  }

  public next(): void {
    this.goToSlide(this.currentIndex + 1, true);
  }

  public prev(): void {
    this.goToSlide(this.currentIndex - 1, false);
  }

  public getSlides(): FlatSlide[] {
    return this.slides;
  }

  public goToSlideById(id: string): void {
    const idx = this.slides.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.goToSlide(idx, idx > this.currentIndex);
    }
  }

  public async updateSlides(newSlides: FlatSlide[], jumpToIndex?: number): Promise<void> {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const newTextures: THREE.Texture[] = [];
    const newDims: THREE.Vector2[] = [];

    const loadPromises = newSlides.map(async (slide, idx) => {
      const existingIdx = this.slides.findIndex((s) => s.id === slide.id || s.image === slide.image);
      if (existingIdx !== -1 && this.textures[existingIdx]) {
        newTextures[idx] = this.textures[existingIdx];
        newDims[idx] = this.imageDimensions[existingIdx] || new THREE.Vector2(1920, 1080);
        return;
      }

      return new Promise<void>((resolve) => {
        loader.load(
          slide.image,
          (texture) => {
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            newTextures[idx] = texture;
            const img = texture.image;
            newDims[idx] = new THREE.Vector2(img.width || 1920, img.height || 1080);
            resolve();
          },
          undefined,
          () => {
            newTextures[idx] = this.createSolidTexture(slide.backgroundColor);
            newDims[idx] = new THREE.Vector2(1920, 1080);
            resolve();
          }
        );
      });
    });

    await Promise.all(loadPromises);
    this.slides = newSlides;
    this.textures = newTextures;
    this.imageDimensions = newDims;

    if (typeof jumpToIndex === 'number' && jumpToIndex >= 0 && jumpToIndex < this.slides.length) {
      this.goToSlide(jumpToIndex, true);
    } else if (this.currentIndex >= this.slides.length) {
      this.currentIndex = 0;
      this.goToSlide(0, false);
    }
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  private onResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.material.uniforms.uResolution.value.set(width, height);
  }

  private animate = (): void => {
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();

    // Smooth lerp for mouse parallax
    this.currentMouse.lerp(this.targetMouse, 0.05);
    this.material.uniforms.uMouse.value.copy(this.currentMouse);

    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.animate);
  };

  public destroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.dispose();
    this.material.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
