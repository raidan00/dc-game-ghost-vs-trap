import * as t from "three"
import { gsap } from "gsap";
import g from "./global.js";
import models from "./models.js";

let offset = 20;
export default class {
	constructor(){ 
		let hash = this.hash = {};
		function activatePlatform(group){
			function addPhysics(){
				g.dcWorld.add(group);
				let plat = group.getObjectByName("platform");
				plat.dcData.onCollision.push((tObj)=>{
					if(tObj != g.player)return;
					for(let offsetX = -offset; offsetX <= offset; offsetX +=offset){
						for(let offsetZ = -offset; offsetZ <= offset; offsetZ +=offset){
							let hashX = group.position.x + offsetX;
							let hashZ = group.position.z + offsetZ;
							if(hash[hashX+"|"+hashZ] == undefined)addTile(hashX, hashZ);
						}
					}
				});
			}
			addPhysics();
			let destroy1 = Date.now()+20000+Math.random()*50000;
			let destroy2 = destroy1+10000;
			let remove = destroy2+5000;
			group.dcData = {
				onAfterPhysics:[()=>{
					if(Date.now() > destroy1){
						destroy1 = Infinity;
						g.dcWorld.remove(group.children[0]);
						group.add(models.crack1.scene.clone());
						addPhysics();
					}
					if(Date.now() > destroy2){
						destroy2 = Infinity;
						g.dcWorld.remove(group.children[0]);
						group.add(models.crack2.scene.clone());
						addPhysics();
					}
					if(Date.now() > remove){
						g.dcWorld.remove(group);
						delete hash[group.position.x+"|"+group.position.z]
					}
				}],
			};
		}
		function addTile(x, z){
			let group = new t.Group();
			group.position.set(x, 0, z);
			let plat = models.platform.scene.clone();
			group.add(plat);
			g.dcWorld.scene.add(group);
			hash[x+"|"+z] = group;
			gsap.from(group.position, {
				y: 20,
				duration: 0.5+0.6*Math.random(),
				ease: "Power1.easeInOut",
				onComplete: ()=>{
					activatePlatform(group);
				}
			});
			group.dcData = {
				onDestroy:[
					()=>{
						gsap.killTweensOf(group.position);
					}
				]
			}
		}
		hash["0|0"] = new t.Group();
		hash["0|0"].add(models.platform.scene.clone());
		g.dcWorld.scene.add(hash["0|0"]);
		activatePlatform(hash["0|0"]);
	}
	destroy(){
		for(let key in this.hash){
			g.dcWorld.remove(this.hash[key]);
		}
	}
}
