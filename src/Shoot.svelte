<!--
	https://en.wikipedia.org/wiki/Projectile_motion#Angle_of_reach
	https://www.youtube.com/watch?v=3UYjw30h0jU
-->
<script context="module">
	import { onDestroy } from "svelte";
	import g from "./global.js";
	import models from "./models.js";
	import * as t from "three"
	import * as dc from 'dvijcock';
	import effects from "./effects.js";
	import throwFile from './assets/04_Fire_explosion_04_medium.wav';
	import explosionFile from './assets/DeathFlash.flac';
	const audioLoader = new t.AudioLoader();
	let throwBuffer;
	let explosionBuffer;

	function shoot(){
		let ammoEnought = true;
		g.ammo.update((n) =>{
			if(n<=0){
				ammoEnought = false;
				return n;
			}
			return n-1;
		});
		if(!ammoEnought)return;
		if(!g.listener){
			g.listener = new t.AudioListener();
			g.dcWorld.camera.add(g.listener);
			audioLoader.load(throwFile, function(buffer) {
				throwBuffer = buffer;
			});
			audioLoader.load(explosionFile, function(buffer) {
				explosionBuffer = buffer;
			});
		}
		if(!g.dcLogic.shooterControls.locked)return;
		let grav = g.dcWorld.physicsWorld.getGravity().y();
		let vel = 15;
		let x = 1000;
		let y = 0;
		let pos = new t.Vector3();
		g.shootStart.getWorldPosition(pos);
		let quat = new t.Quaternion();
		g.shootStart.getWorldQuaternion(quat);

		const raycaster = new t.Raycaster();
		const pointer = new t.Vector2();
		raycaster.setFromCamera(pointer, g.dcWorld.camera);
		const intersects = raycaster.intersectObjects(g.dcWorld.scene.children);
		const point =  intersects.filter((intersect)=>{
			if(intersect.object == g.ghostModel)return false;
			if(intersect.object == g.player)return false;
			return true;
		})?.[0]?.point;
		if(point){
			x = point.distanceTo(pos);
			y = pos.y - point.y;
		}
		const bomb = models.bomb.scene.children[0].clone();
		bomb.position.copy(pos);
		g.dcWorld.add(bomb);
		bomb.dcData.type = "bomb";

		let nextSpark = Date.now() + Math.random()*100;
		bomb.dcData.onAfterPhysics.push(()=>{
			if(Date.now() < nextSpark)return;
			nextSpark = Date.now() + Math.random()*100;
			let sparkPos = new t.Vector3();
			bomb.children[0].getWorldPosition(sparkPos);
			effects.addSpark(sparkPos);
		});
		bomb.dcData.onCollision.push((tObj)=>{
			if(tObj.dcData.type == "player")return;
			if(tObj.dcData.type == "spark")return;
			g.dcWorld.remove(bomb);
			for(let i=0; i<10; i++){
				//function addSpark(pos, size = 3, lifetime = 200, expansion = 1){
				let spark = effects.addSpark(bomb.position, 50, 600, 10)
				if(i==0){
					const sound = new t.PositionalAudio(g.listener);
					spark.add(sound);
					sound.setBuffer(explosionBuffer);
					sound.setRefDistance(20);
					sound.onEnded = ()=>sound.removeFromParent();
					sound.play();
				}
			}
			let removeArr = [];
			g.dcWorld.scene.traverse((tObj)=>{
				if(tObj?.userData?.type == "trap"
				&& bomb.position.distanceTo(tObj.position) < 6){
					removeArr.push(tObj);
				};
			});
			for (let el of removeArr) {
				g.dcWorld.remove(el);
			}
		});
		let rot= -Math.atan( (vel**2-Math.sqrt(vel**4-grav*(grav*x**2+2*y*vel**2))) / (grav*x));
		if(!rot)rot = Math.PI/4;
		let vec = new t.Vector3(Math.cos(rot), Math.sin(rot), 0);
		vec.applyQuaternion(quat);
		vec.multiplyScalar(vel);
		bomb.dcData.rbody.setLinearVelocity(dc.ammoTmp.vec(vec.x, vec.y, vec.z));
		bomb.dcData.rbody.setAngularVelocity(dc.ammoTmp.vec(Math.random()*5, Math.random()*5, Math.random()*5));

		const sound = new t.PositionalAudio(g.listener);
		bomb.add(sound);
		sound.setBuffer(throwBuffer);
		sound.setVolume(0.7);
		sound.setRefDistance(5);
		sound.onEnded = ()=>sound.removeFromParent();
		sound.play();
	}

	const initShoot = ()=>{
		g.dcWorld.renderer.domElement.addEventListener("pointerdown", shoot);
	};
	export { initShoot };
</script>
<script>
	function onKeyDown(e){
		if(e.code == "Space"){
			shoot();
		}
	}
	onDestroy(() => {
		g.dcWorld.renderer.domElement.removeEventListener("pointerdown", shoot);
	});
</script>

<!--<button class="skill1" on:click={shoot}>shoot</button>-->
<svelte:window on:keydown={onKeyDown}/>

<style>
	button {
		bottom: 0px;
		right: 0px;
		font-size: min(3vw, 3vh);
		width: min(25vw, 25vh);
		height: min(25vw, 25vh);
		border-radius: 50%;
		align-items: center;
		justify-content: center;
		display: flex;
		position: fixed;
	}
</style>
