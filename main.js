import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

const pane = new Pane();
const scene = new THREE.Scene();

// === Texture Loaders ===
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Load skybox (make sure /public/cubeMesh/ has px.png, nx.png, py.png, ny.png, pz.png, nz.png)
const backgroundCubeMap = cubeTextureLoader.setPath("/cubeMesh/").load([
  "px.png", "nx.png",
  "py.png", "ny.png",
  "pz.png", "nz.png"
]);
scene.background = backgroundCubeMap;

// Planet Textures
const sunTexture = textureLoader.load("/2k_sun.jpg");
const moonTexture = textureLoader.load("/2k_moon.jpg");
const venusTexture = textureLoader.load("/2k_venus_surface.jpg");
const mercuryTexture = textureLoader.load("/2k_mercury.png");
const earthTexture = textureLoader.load("/2k_earth.png");
const marsTexture = textureLoader.load("/2k_mars.png");
const jupiterTexture = textureLoader.load("/8k_jupiter.jpg");
const saturnTexture = textureLoader.load("/8k_saturn.jpg");
const uranusTexture = textureLoader.load("/2k_uranus.jpg");
const neptuneTexture = textureLoader.load("/2k_neptune.jpg");

// === Materials (use StandardMaterial so they react to lights) ===
const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTexture });
const venusMaterial   = new THREE.MeshStandardMaterial({ map: venusTexture });
const earthMaterial   = new THREE.MeshStandardMaterial({ map: earthTexture });
const marsMaterial    = new THREE.MeshStandardMaterial({ map: marsTexture });
const moonMaterial    = new THREE.MeshStandardMaterial({ map: moonTexture });
const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTexture });
const saturnMaterial  = new THREE.MeshStandardMaterial({ map: saturnTexture });
const uranusMaterial  = new THREE.MeshStandardMaterial({ map: uranusTexture });
const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTexture });

// === Camera ===
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 400);
camera.position.set(0, 5, 100);
scene.add(camera);

// === Geometry ===
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// Sun (kept MeshBasicMaterial so it “glows”)
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(5);
scene.add(sun);

// === Planet Data ===
const planets = [
  { name: "Mercury", radius: 0.3, distance: 8,  speed: 0.1,   material: mercuryMaterial, moons: [] },
  { name: "Venus",   radius: 0.5, distance: 12, speed: 0.01,  material: venusMaterial,   moons: [] },
  {
    name: "Earth",
    radius: 1,
    distance: 10,
    speed: 0.008,
    material: earthMaterial,
    moons: [
      { name: "Moon", radius: 0.27, distance: 2, speed: 0.03, material: moonMaterial }
    ],
  },
  {
    name: "Mars",
    radius: 0.53,
    distance: 20,
    speed: 0.006,
    material: marsMaterial,
    moons: [
      { name: "Phobos", radius: 0.20, distance: 2, speed: 0.05 },
      { name: "Deimos", radius: 0.18, distance: 3, speed: 0.04 }
    ],
  },
    {
    name: "Jupiter",
    radius: 3,
    distance: 28,
    speed: 0.004,
    material: jupiterMaterial, // load jupiter texture
    moons: [
      { name: "Io",       radius: 0.3,  distance: 4, speed: 0.05 },
      { name: "Europa",   radius: 0.25, distance: 6, speed: 0.04 },
      { name: "Ganymede", radius: 0.4,  distance: 8, speed: 0.03 },
      { name: "Callisto", radius: 0.35, distance: 10, speed: 0.02 }
    ],
  },
  {
    name: "Saturn",
    radius: 2.5,
    distance: 38,
    speed: 0.003,
    material: saturnMaterial, // load saturn texture
    moons: [
      { name: "Titan",    radius: 0.4,  distance: 5, speed: 0.03 },
      { name: "Enceladus",radius: 0.15, distance: 7, speed: 0.04 }
    ],
   
  },
  {
    name: "Uranus",
    radius: 2,
    distance: 48,
    speed: 0.002,
    material: uranusMaterial, // load uranus texture
    moons: [
      { name: "Miranda", radius: 0.15, distance: 4, speed: 0.05 },
      { name: "Titania", radius: 0.2,  distance: 6, speed: 0.04 }
    ]
  },
  {
    name: "Neptune",
    radius: 1.9,
    distance: 58,
    speed: 0.0015,
    material: neptuneMaterial, // load neptune texture
    moons: [
      { name: "Triton", radius: 0.3, distance: 5, speed: 0.04 }
    ]
  }
];

// === Functions to create planets & moons ===
const createMoon = (moonData, planetMesh, index = 0) => {
  const mat = moonData.material && moonData.material.isMaterial
    ? moonData.material
    : new THREE.MeshStandardMaterial({ map: moonTexture });

  const moonMesh = new THREE.Mesh(sphereGeometry, mat);
  moonMesh.scale.setScalar(moonData.radius);
  moonMesh.position.x = moonData.distance;
  moonMesh.position.z = index * 1.5;

  moonMesh.castShadow = true;
  moonMesh.receiveShadow = true;

  moonMesh.userData = {
    angle: Math.random() * Math.PI * 2,
    speed: moonData.speed,
    distance: moonData.distance,
  };

  planetMesh.add(moonMesh);
  return moonMesh;
};

const createPlanet = (planet) => {
  const mat = planet.material && planet.material.isMaterial
    ? planet.material
    : new THREE.MeshStandardMaterial({ map: planet.material });

  const planetMesh = new THREE.Mesh(sphereGeometry, mat);
  planetMesh.scale.setScalar(planet.radius);
  planetMesh.position.x = planet.distance;

  planetMesh.castShadow = true;
  planetMesh.receiveShadow = true;

  planet.moons.forEach((m, idx) => createMoon(m, planetMesh, idx));

  scene.add(planetMesh);
  return planetMesh;
};

const planetMeshes = planets.map((planet) => createPlanet(planet));

// === Lights ===
// Softer ambient light so dark sides aren’t pitch black
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Point light at the Sun’s position (main sunlight)
const sunlight = new THREE.PointLight(0xffffff, 3, 2000);
sunlight.position.set(0, 0, 0);
sunlight.castShadow = true;

// Softer shadows
sunlight.shadow.mapSize.width = 2048;
sunlight.shadow.mapSize.height = 2048;
sunlight.shadow.bias = -0.001; // helps reduce shadow artifacts

scene.add(sunlight);


// === Renderer ===
const canvas = document.querySelector(".animation");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const controls = new OrbitControls(camera, canvas);

// === Resize Handler ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Animation Loop ===
const renderLoop = () => {
  sun.rotation.y += 0.01;

  planetMeshes.forEach((planetMesh, index) => {
    const p = planets[index];
    planetMesh.rotation.y += p.speed;
    planetMesh.position.x = Math.sin(planetMesh.rotation.y) * p.distance;
    planetMesh.position.z = Math.cos(planetMesh.rotation.y) * p.distance;

    p.moons.forEach((moonData, moonIndex) => {
      const moonMesh = planetMesh.children[moonIndex];
      if (!moonMesh) return;
      moonMesh.userData.angle += moonData.speed;
      moonMesh.position.x = Math.sin(moonMesh.userData.angle) * moonData.distance;
      moonMesh.position.z = Math.cos(moonMesh.userData.angle) * moonData.distance;
    });
  });

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderLoop);
};

renderLoop();
