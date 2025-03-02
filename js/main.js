import * as THREE from 'three';
import { OrbitControls } from 'three/controls';

class SolarSystem {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('solar-system'),
            antialias: true
        });
        
        this.setupScene();
        this.createLights();
        this.createControls();
        this.createPlanets();
        this.addEventListeners();
        this.animate();
    }

    setupScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.z = 50;
        
        // 添加星空背景
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 5000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.1 });
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x444444);
        this.scene.add(ambientLight);

        const sunLight = new THREE.PointLight(0xFFFFFF, 2);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 100;
    }

    createTextCanvas(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'Bold 40px Arial';
        context.textAlign = 'center';
        context.fillStyle = 'white';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        return canvas;
    }

    createPlanetTexture(color, pattern) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        // 设置背景色
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 添加白色花纹
        context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        context.lineWidth = 2;

        switch(pattern) {
            case 'dots':
                for(let i = 0; i < 100; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    context.beginPath();
                    context.arc(x, y, 2, 0, Math.PI * 2);
                    context.stroke();
                }
                break;
            case 'stripes':
                for(let i = 0; i < canvas.height; i += 20) {
                    context.beginPath();
                    context.moveTo(0, i);
                    context.lineTo(canvas.width, i);
                    context.stroke();
                }
                break;
            case 'circles':
                for(let i = 0; i < 5; i++) {
                    context.beginPath();
                    context.arc(canvas.width/2, canvas.height/2, 30 + i * 20, 0, Math.PI * 2);
                    context.stroke();
                }
                break;
            case 'grid':
                for(let i = 0; i < canvas.width; i += 30) {
                    context.beginPath();
                    context.moveTo(i, 0);
                    context.lineTo(i, canvas.height);
                    context.stroke();
                    context.moveTo(0, i);
                    context.lineTo(canvas.width, i);
                    context.stroke();
                }
                break;
            case 'swirl':
                let angle = 0;
                let radius = 0;
                context.beginPath();
                while(radius < canvas.width/2) {
                    const x = canvas.width/2 + radius * Math.cos(angle);
                    const y = canvas.height/2 + radius * Math.sin(angle);
                    if(radius === 0) context.moveTo(x, y);
                    else context.lineTo(x, y);
                    angle += 0.1;
                    radius += 0.5;
                }
                context.stroke();
                break;
        }

        return canvas;
    }

    createPlanets() {
        // 行星数据
        this.planetsData = [
            { name: '太阳', englishName: 'Sun', radius: 5, color: '#FFD700', orbitRadius: 0, pattern: 'circles' },
            { name: '水星', englishName: 'Mercury', radius: 0.8, color: '#A0522D', orbitRadius: 8, pattern: 'dots' },
            { name: '金星', englishName: 'Venus', radius: 1.2, color: '#DEB887', orbitRadius: 12, pattern: 'stripes' },
            { name: '地球', englishName: 'Earth', radius: 1.4, color: '#4169E1', orbitRadius: 16, pattern: 'grid' },
            { name: '火星', englishName: 'Mars', radius: 1.0, color: '#CD5C5C', orbitRadius: 20, pattern: 'dots' },
            { name: '木星', englishName: 'Jupiter', radius: 3.0, color: '#DAA520', orbitRadius: 26, pattern: 'stripes' },
            { name: '土星', englishName: 'Saturn', radius: 2.5, color: '#F4A460', orbitRadius: 32, pattern: 'swirl' },
            { name: '天王星', englishName: 'Uranus', radius: 1.8, color: '#87CEEB', orbitRadius: 38, pattern: 'grid' },
            { name: '海王星', englishName: 'Neptune', radius: 1.7, color: '#1E90FF', orbitRadius: 44, pattern: 'circles' },
            { name: '冥王星', englishName: 'Pluto', radius: 0.6, color: '#8B4513', orbitRadius: 50, pattern: 'dots' }
        ];

        this.planets = [];
        this.orbits = [];
        this.labels = [];

        // 创建行星和轨道
        this.planetsData.forEach(data => {
            // 创建行星纹理
            const texture = new THREE.CanvasTexture(this.createPlanetTexture(data.color, data.pattern));
            
            // 创建行星
            const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ 
                map: texture,
                shininess: 30
            });
            const planet = new THREE.Mesh(geometry, material);
            planet.userData = { name: data.name, englishName: data.englishName };
            
            if (data.name === '太阳') {
                planet.material.emissive = new THREE.Color(0xFFFF00);
                planet.material.emissiveIntensity = 0.5;
            }

            // 创建标签
            const labelTexture = new THREE.CanvasTexture(this.createTextCanvas(data.englishName));
            const labelMaterial = new THREE.SpriteMaterial({ 
                map: labelTexture,
                transparent: true
            });
            const label = new THREE.Sprite(labelMaterial);
            label.scale.set(data.radius * 4, data.radius * 2, 1);
            label.position.y = data.radius + 1;
            planet.add(label);

            // 创建轨道
            if (data.orbitRadius > 0) {
                const orbitGeometry = new THREE.BufferGeometry();
                const orbitPoints = [];
                const segments = 128;
                
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    orbitPoints.push(
                        Math.cos(theta) * data.orbitRadius,
                        0,
                        Math.sin(theta) * data.orbitRadius
                    );
                }
                
                orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
                const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
                const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
                this.scene.add(orbit);
                this.orbits.push(orbit);
            }

            this.scene.add(planet);
            this.planets.push({
                mesh: planet,
                orbitRadius: data.orbitRadius,
                angle: Math.random() * Math.PI * 2
            });
        });
    }

    addEventListeners() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.planets.map(p => p.mesh));
            
            const planetInfo = document.getElementById('planet-info');
            const planetName = document.getElementById('planet-name');
            const planetDescription = document.getElementById('planet-description');

            if (intersects.length > 0) {
                const planet = intersects[0].object;
                planetInfo.style.display = 'block';
                planetName.textContent = `${planet.userData.name} (${planet.userData.englishName})`;
                planetDescription.textContent = this.getPlanetDescription(planet.userData.name);
            } else {
                planetInfo.style.display = 'none';
            }
        });
    }

    getPlanetDescription(name) {
        const descriptions = {
            '太阳': '太阳系的中心天体，一个巨大的氢氦气体球。',
            '水星': '最靠近太阳的行星，表面温度变化极大。',
            '金星': '体积与地球相近，被称为"晨星"或"昏星"。',
            '地球': '唯一已知存在生命的行星，表面有液态水。',
            '火星': '被称为"红色星球"，表面有大量氧化铁。',
            '木星': '太阳系最大的行星，有引人注目的大红斑。',
            '土星': '以其壮观的环系统闻名于世。',
            '天王星': '自转轴与公转轨道几乎垂直。',
            '海王星': '有强大的风暴系统，风速可达每小时2000公里。',
            '冥王星': '曾经的第九大行星，现在被归类为矮行星。'
        };
        return descriptions[name] || '';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // 更新行星位置
        this.planets.forEach((planet, index) => {
            if (index > 0) { // 跳过太阳
                // 计算行星位置
                planet.angle += (0.02 / Math.sqrt(planet.orbitRadius)); // 轨道半径越大，运动越慢
                const x = Math.cos(planet.angle) * planet.orbitRadius;
                const z = Math.sin(planet.angle) * planet.orbitRadius;
                planet.mesh.position.set(x, 0, z);
                
                // 行星自转
                planet.mesh.rotation.y += 0.01;
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// 创建太阳系实例
new SolarSystem();