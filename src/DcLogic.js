import * as t from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dc from 'dvijcock';
import models from "./models.js";
import g from "./global.js";
import TilePlatforms from "./TilePlatforms.js";
import Traps from "./Traps.js";
import { initShoot } from "./Shoot.svelte";

export default class{
	constructor(){}
	init(){
		g.dcLogic = this;
		g.dcWorld = g.dcLogic.dcWorld;
		g.dcWorld.scene.add(dc.defaultLights);

		g.dcWorld.camera = new t.PerspectiveCamera( 65, 1/*dc will set acpect*/, 0.1, 30000 );
		g.dcWorld.camera.position.set(0,4,-4);
		g.dcWorld.scene.add(g.dcWorld.camera);

		initShoot();

		this.recreate();
		this.interval = setInterval(()=>{
			g.spawnDelay -= 10;
			if(g.spawnDelay < 100)g.spawnDelay = 100;
			g.trapSpeed += 0.0002; 
			let removeArr = [];
			g.dcWorld.scene.traverse((tObj)=>{
				if(tObj.position.y > -30)return
				if(tObj?.dcData?.type == "bomb" || tObj?.dcData?.type == "player"){
					removeArr.push(tObj);
				};
			});
			for (let el of removeArr) {
				if(el.dcData.type == "bomb"){
					g.dcWorld.remove(el);
				}else if(el.dcData.type == "player"){
					setTimeout(()=>g.dcLogic.recreate(), 0);
				}
			}
		},500);
	}
	recreate(){
		g.spawnDelay = 2000;
		g.trapSpeed = 0.04; 
		if(g.player)g.dcWorld.remove(g.player);
		g.player = models.ghost.scene.getObjectByName("shape").clone();
		g.player.visible = false;
		g.player.position.y = 1.5;
		g.player.dcData = {
			setFriction: 3,
			type: "player",
		}
		g.dcWorld.add(g.player);
		g.player.dcData.onCollision.push((tObj)=>{
			if(tObj?.userData?.type == "trap"){
				setTimeout(()=>g.dcLogic.recreate(), 0);
			}
		})
		g.player.dcData.rbody.setAngularFactor(dc.ammoTmp.vec(0, 0, 0));
		
		if(g.dcLogic.shooterControls){
			g.dcLogic.shooterControls.target = g.player;
		}else{
			g.dcLogic.shooterControls = new dc.ShooterControls(g.player, g.dcWorld.camera, g.dcWorld.renderer.domElement);
			g.dcLogic.shooterControls.tpsOffset.y = 2;
		}

		if(g.dcLogic.moveController){
			g.dcLogic.moveController.setTarget(g.player);
		}else{
			g.dcLogic.moveController = new dc.MoveController(g.player, g.dcLogic.shooterControls.spherical, 0.5, 3);
		}

		if(g.ghostModel)g.dcWorld.scene.remove(g.ghostModel);
		g.ghostModel = models.ghost.scene.getObjectByName("model").clone();
		g.shootStart = new t.Object3D();
		g.shootStart.position.x = 1;
		g.ghostModel.add(g.shootStart);
		g.dcWorld.scene.add(g.ghostModel);
		g.player.dcData.onAfterPhysics.push(()=>{
			g.ghostModel.position.copy(g.player.position);
			g.ghostModel.rotation.y = g.dcLogic.shooterControls.spherical.theta + Math.PI/2;
			g.ghostModel.visible = g.dcLogic.shooterControls.spherical.radius > 0;
		});

		if(g.dcLogic.platforms)this.platforms.destroy();
		g.dcLogic.platforms = new TilePlatforms();

		if(g.dcLogic.traps)this.traps.destroy();
		g.dcLogic.traps = new Traps();
		g.ammo.set(10);
	}
	destroy(){
		this.moveController.destroy();
		this.shooterControls.destroy();
		this.traps.destroy();
		this.platforms.destroy();
		clearInterval(this.interval);
	}
}
