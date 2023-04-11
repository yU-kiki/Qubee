import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 2 / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 1000);

// 平行光源を作成
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 1000);
scene.add(directionalLight);

// WebGLレンダラーを作成
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#myCanvas')
});
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth / 2, window.innerHeight);

// 滑らかにカメラコントローラーを制御する
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;

// ジオメトリを作成(Box)
const geometry = new THREE.BoxGeometry(300, 300, 300);

// 画像を貼り付けるとき
const loadPic = new THREE.TextureLoader();

// マテリアルを初期化
const material = []
const cube = new THREE.Mesh(geometry, material);

// const meshMaterial = new THREE.MeshLambertMaterial({
//   color: 0xffffff,
//   opacity: 0.2,
//   side: THREE.DoubleSide,
//   transparent: true
// });
// const cube = new THREE.Mesh(geometry, meshMaterial);
// scene.add(cube);

// 面の色を格納する配列
const colors = ["#FDDE00", "#ffffff", "#004AC3", "#178A28", "#F8030A", "#FF8006"]
// 画像のURLを格納する配列
const imgUrls = ["", "", "", "", "", ""];

let canvas;

// ToDo: 初期設定を分ける
// テクスチャーを更新する
function updateMesh() {
  for (let i = 0; i < 6; i++) {
    if (imgUrls[i] !== "") {
      const texture = loadPic.load(imgUrls[i]);
      texture.minFilter = THREE.LinearFilter;
      cube.material[i] = new THREE.MeshBasicMaterial({ map: texture });
      // プレビューの表示
      const previewImg = document.getElementById("preview-" + (i + 1));
      previewImg.src = imgUrls[i];
    } else {
      cube.material[i] = new THREE.MeshBasicMaterial({ color: colors[i] });
      const img = new Image();
      img.addEventListener("load", () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 512;
        canvas.height = 512;
        ctx.fillStyle = colors[i];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        imgUrls[i] = canvas.toDataURL();
        // プレビューの表示
        const previewImg = document.getElementById("preview-" + (i + 1));
        previewImg.src = imgUrls[i];
      });
      img.src = "blank.png";
    }
  }
}

// 毎フレーム時に実行されるループイベント
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;
  renderer.render(scene, camera);
}

const file = document.getElementById('input-file');

function updateImage(input, number) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const img = new Image();
    img.addEventListener('load', () => {
      // 画像のサイズを調整
      const MAX_SIZE = 512;
      let width = img.width;
      let height = img.height;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;

      const index = ["1", "2", "3", "4", "5", "6"].indexOf(number);
      // 画像を貼り付ける
      const preImg = new Image();
      preImg.addEventListener('load', () => {
        ctx.drawImage(preImg, 0, 0, canvas.width, canvas.width);
        ctx.drawImage(img, 0, 0, width, height);
        imgUrls[index] = canvas.toDataURL();
        // テクスチャーを更新
        updateMesh();
      });
      preImg.src = imgUrls[index];
    });
    img.src = reader.result;
  });
  reader.readAsDataURL(file);
}

// ファイルが選択されたら実行
file.addEventListener('change', (event) => {
  const number = document.querySelector('.face__container input[name="number"]:checked').value
  updateImage(event.target, number);
});

// 初期化
function init() {
  scene.add(cube);
  animate();
}

window.addEventListener('DOMContentLoaded', () => {
  init();
  updateMesh();
});