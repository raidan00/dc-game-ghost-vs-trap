import * as t from "three"
import { gsap } from "gsap";
import g from "./global.js";
import models from "./models.js";

export default class {
	constructor(){ 
		let spawnRadius = 25;
		let moveTime = 10;
		let moveTrap = (trap)=>{
			let start = new t.Vector2(trap.position.x, trap.position.z);
			let midle = new t.Vector2(g.player.position.x, g.player.position.z);
			let dirV = midle.clone().sub(start).normalize();
			let distance = start.distanceTo(midle)*1.2; 
			let end = start.clone().add(dirV.multiplyScalar(distance))
			gsap.to(trap.rotation, {
				y: Math.atan2(-dirV.y, dirV.x),
				duration: 0.5,
			});
			gsap.to(trap.position, {
				x: end.x,
				duration: moveTime,
				ease: "none",
				onComplete: ()=>{
					moveTrap(trap);
				}
			});
			gsap.to(trap.position, {
				z: end.y,
				ease: "none",
				duration: moveTime,
			});
		}
		let addTrap = ()=>{
			if(this.stopped)return;
			let trap = models.trap.scene.children[0].clone();
			trap.scale.multiplyScalar(0.5+(Math.random()*1));
			let angle = Math.random()*Math.PI*2;
			trap.position.x = g.player.position.x - Math.cos(angle)*spawnRadius;
			trap.position.z = g.player.position.z - Math.sin(angle)*spawnRadius;
			trap.position.y = trap.scale.y;
			g.dcWorld.add(trap);
			trap.dcData.onBeforePhysics.push(()=>{
				let start = new t.Vector2(trap.position.x, trap.position.z);
				let midle = new t.Vector2(g.player.position.x, g.player.position.z);
				let dirV = midle.clone().sub(start).normalize();
				let end = start.clone().add(dirV.multiplyScalar(g.trapSpeed))
				trap.position.x = end.x;
				trap.position.z = end.y;
				trap.rotation.y = Math.atan2(-dirV.y, dirV.x);
			});
			//moveTrap(trap);
			setTimeout(addTrap, g.spawnDelay);
		}
		addTrap();
	}
	destroy(){
		this.stopped = true;
		let removeArr = [];
		g.dcWorld.scene.traverse((tObj)=>{
			if(tObj?.userData?.type == "trap"){
				removeArr.push(tObj);
			};
		});
		for (let el of removeArr) {
			g.dcWorld.remove(el);
		}
	}
}
