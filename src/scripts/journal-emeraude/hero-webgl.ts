import * as THREE from 'three';

export class EmeraudeHeroWebGL {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.Mesh | null = null;
  private texture: THREE.Texture | null = null;
  
  private mouse = new THREE.Vector2(0.5, 0.5);
  private targetMouse = new THREE.Vector2(0.5, 0.5);
  private clock = new THREE.Clock();
  private animationFrameId: number = 0;
  private isDestroyed = false;

  constructor(containerId: string, imageSrc: string) {
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`[EmeraudeHeroWebGL] Container #${containerId} not found.`);
      return;
    }
    this.container = el;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'emeraude-webgl-canvas';
    this.container.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.init(imageSrc);
  }

  private init(imageSrc: string) {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageSrc,
      (tex) => {
        if (this.isDestroyed) return;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        this.texture = tex;
        this.setupShader();
        this.bindEvents();
        this.animate();
      },
      undefined,
      (err) => {
        console.error('[EmeraudeHeroWebGL] Error loading texture:', err);
      }
    );
  }

  private setupShader() {
    if (!this.texture) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform vec2 uTextureResolution;
      varying vec2 vUv;

      // Fonction d'adaptation Cover aspect-ratio
      vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 texRes) {
        vec2 ratio = vec2(
          min((screenRes.x / screenRes.y) / (texRes.x / texRes.y), 1.0),
          min((screenRes.y / screenRes.x) / (texRes.y / texRes.x), 1.0)
        );
        return vec2(
          uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
          uv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );
      }

      void main() {
        vec2 screenUv = vUv;
        vec2 uv = getCoverUv(screenUv, uResolution, uTextureResolution);

        // Onde liquide suivant la souris
        float distToMouse = distance(screenUv, uMouse);
        float mouseWave = sin(distToMouse * 18.0 - uTime * 3.0) * exp(-distToMouse * 4.5);

        // Respiration ambiante douce
        float ambientWave1 = sin(uv.x * 4.0 + uTime * 0.8) * cos(uv.y * 3.0 + uTime * 0.6) * 0.008;
        float ambientWave2 = cos(uv.y * 5.0 - uTime * 0.5) * 0.006;

        vec2 distortion = vec2(
          mouseWave * 0.035 + ambientWave1,
          mouseWave * 0.035 + ambientWave2
        );

        // Aberration chromatique (séparation RGB luxe)
        float rShift = 0.004 * (1.0 + distToMouse * 1.5);
        float bShift = -0.004 * (1.0 + distToMouse * 1.5);

        float r = texture2D(uTexture, uv + distortion + vec2(rShift, 0.0)).r;
        float g = texture2D(uTexture, uv + distortion).g;
        float b = texture2D(uTexture, uv + distortion + vec2(bShift, 0.0)).b;

        vec3 color = vec3(r, g, b);

        // Teinte émeraude subtile sur les ombres et reflets
        vec3 emeraudeTint = vec3(0.02, 0.12, 0.08);
        color = mix(color, color + emeraudeTint, 0.35);

        // Vignette cinématographique
        float vignette = smoothstep(1.3, 0.3, length(screenUv - 0.5));
        color *= vignette * 0.95;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 },
        uMouse: { value: this.mouse },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTextureResolution: { value: new THREE.Vector2(1600, 900) }
      },
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // Inversion Three.js
      this.targetMouse.set(x, y);
    }
  };

  private onResize = () => {
    if (!this.renderer || !this.material) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.material.uniforms.uResolution.value.set(width, height);
  };

  private bindEvents() {
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private animate = () => {
    if (this.isDestroyed) return;

    // Inertie douce pour la souris
    this.mouse.lerp(this.targetMouse, 0.08);

    if (this.material) {
      this.material.uniforms.uTime.value = this.clock.getElapsedTime();
      this.material.uniforms.uMouse.value.copy(this.mouse);
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    if (this.texture) this.texture.dispose();
    if (this.material) this.material.dispose();
    if (this.mesh) this.mesh.geometry.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
