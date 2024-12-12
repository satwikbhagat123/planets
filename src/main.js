import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// Setup scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true
});

// Configure renderer
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(8);


const loader = new RGBELoader();
 loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr' , function (texture) {
texture.mapping = THREE.EquirectangularReflectionMapping;
// scene.background = texture;
scene.environment = texture;
});


const radius = 1.3;
const orbitRadius = 4.5;
const segments = 64;
const colors = [0x00ff00, 0x0000ff, 0xff0000, 0x00ffff];
const textures = ["./csilla/color.png" , "./earth/map.jpg" , "./venus/map.jpg" , "./volcanic/color.png"]
const spheres = new THREE.Group();

// Create a large sphere for the starfield background
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide // Render on the inside of the sphere
});
const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);


// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light for HDRI-like lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Add hemisphere light for natural sky lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

const spheresMesh =[]


for (let i = 0; i < 4; i++) {

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load( textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);

spheresMesh.push(sphere);
  
  const angle = (i/4) * (Math.PI * 2);
  sphere.position.x = Math.cos(angle) * orbitRadius;
  sphere.position.z = Math.sin(angle) * orbitRadius;

  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);


let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

// Add these variables at the top level
let canvasScrollComplete = false;
const totalRotations = 4; // Number of planet rotations before allowing page scroll
let currentRotation = 0;

function throttledWheelHandler(event) {
  event.preventDefault(); // Prevent default scroll behavior
  
  const currentTime = Date.now();
  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;
    const direction = event.deltaY > 0 ? "down" : "up";
    
    if (!canvasScrollComplete) {
      scrollCount = (scrollCount + 1) % 4;
      
      const headings = document.querySelectorAll('.heading');
      gsap.to(headings, {
        duration: 1,
        y: `-=${100}%`,
        ease: "power2.inOut",
      });
      
      gsap.to(spheres.rotation, {
        duration: 1,
        y: `-=${Math.PI / 2}`,
        ease: "power2.inOut",
        onComplete: () => {
          currentRotation++;
          if (currentRotation >= totalRotations) {
            canvasScrollComplete = true;
          }
        }
      });
      
      if (scrollCount === 0) {
        gsap.to(headings, {
          duration: 1,
          y: '0',
          ease: "power2.inOut",
        });
      }
    } else {
      // Remove the event listener and re-enable normal scrolling
      window.removeEventListener('wheel', throttledWheelHandler);
      enableNormalScroll();
    }
  }
}

function enableNormalScroll() {
  // Create and dispatch a new wheel event to continue the scroll
  const wheelEvent = new WheelEvent('wheel', {
    deltaY: 100,
    bubbles: true
  });
  window.dispatchEvent(wheelEvent);
  
  // Add styles to make the rest of the page scrollable
  document.body.style.overflow = 'auto';
  
  // Optional: Smooth transition for the canvas
  const canvas = document.querySelector('#canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  
  // Add scroll event listener for parallax effect (optional)
  window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) {
      canvas.style.opacity = '0';
    } else {
      canvas.style.opacity = '1';
    }
  });
}

// Prevent default scroll initially
document.body.style.overflow = 'hidden';

// Add the wheel event listener
window.addEventListener('wheel', throttledWheelHandler, { passive: false });


const clock = new THREE.Clock();
// Update the animation loop to rotate the cube
function animate() {
  requestAnimationFrame(animate);
  for (let i = 0; i < spheresMesh.length; i++) {
    const sphere = spheresMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.02;
  }
  renderer.render(scene, camera);
}
animate();


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});






let lastScrollTop = 0;
const header = document.querySelector("header");
const toTop = document.querySelector(".to-top");
const heroSection = document.querySelector(".hero");

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const heroSectionOffsetTop = heroSection.offsetTop;

  if (scrollTop > heroSectionOffsetTop) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }

  if (scrollTop > lastScrollTop) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  lastScrollTop = scrollTop;
});