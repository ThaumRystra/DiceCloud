<template>
  <div>
    <canvas
      ref="map"
      class="tabletop-map"
    />
  </div>
</template>

<script lang="js">
import * as THREE from 'three';
import { Tracker } from 'meteor/tracker'
import { MapControls } from '/imports/api/tabletop/three/OrbitControls.js';

const maps = [
  {
    name: 'first map',
    position: { x: 0, y: 0 },
    width: 5,
    height: 5,
    texture: '/images/battlemap.webp',
  }
];

export default {
  mounted(){
    const scene = new THREE.Scene();
    const perspectiveCam = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    perspectiveCam.position.z = 5;
    const orthoCam = new THREE.OrthographicCamera( -2, 2, 2, -2, 1, 1000 );
    orthoCam.position.z = 5
    const activeCamera = orthoCam;


    const renderer = new THREE.WebGLRenderer({canvas: this.$refs.map});

    activeCamera.up.set( 0, 0, 1 ); // Use z as upwards
    const controls = new MapControls( activeCamera, renderer.domElement );

    maps.forEach(map => {
      const texture = new THREE.TextureLoader().load( map.texture );
      const material = new THREE.MeshBasicMaterial({ map: texture });
      material.map.needsUpdate = true;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(map.width, map.height), material);
      plane.overdraw = true;
      scene.add(plane);
    });

  /*
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );
  */

    function resizeCanvasToDisplaySize() {
      const canvas = renderer.domElement;
      // look up the size the canvas is being displayed
      const width = canvas.clientWidth;
      const height = canvas.clientHeight - 50;

      // adjust displayBuffer size to match
      if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        perspectiveCam.aspect = width / height;
        orthoCam.left= width / -200;
        orthoCam.right = width / 200;
        orthoCam.top = height / 200;
        orthoCam.bottom = height / -200;
        perspectiveCam.updateProjectionMatrix();
        orthoCam.updateProjectionMatrix();
        controls.update();
        renderer.setSize(width, height, false);
      }
    }
    function animate() {
      resizeCanvasToDisplaySize();
      renderer.render( scene, activeCamera );
      requestAnimationFrame( animate );
    }
    animate();
  },
}
</script>

<style>
  .tabletop-map {
    height: 100%;
    width: 100%;
  }
</style>