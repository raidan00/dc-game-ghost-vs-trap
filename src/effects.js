import * as dc from 'dvijcock';
import * as t from "three"
import g from "./global.js";
import sparkImg from './assets/sparkling-fireball-small.png';

let effects = {};
const textureLoader = new t.TextureLoader();
const sparkTexutre = textureLoader.load(sparkImg);
const geometry = new t.BufferGeometry();
const vertices = [0,0,0];
geometry.setAttribute('position', new t.Float32BufferAttribute( vertices, 3));

effects.addSpark = function(pos, size = 3, lifetime = 200, expansion = 1){
	let numX = 8, numY = 7;
	let scaleX = 1/numX, scaleY = 1/numY;
	let material = new t.PointsMaterial({size:size, map: sparkTexutre.clone(), transparent: true,});
	material.map.repeat.set(scaleX, scaleY);
	const particles = new t.Points(geometry, material);
	particles.position.copy(pos);
	particles.dcData = {
		mass: 0.01,
		btShape: new Ammo.btSphereShape(0.1),
		type: "spark",
	}
	g.dcWorld.add(particles);
	particles.dcData.rbody.setLinearVelocity(dc.ammoTmp.vec(
		t.MathUtils.randFloat(-expansion, expansion),
		t.MathUtils.randFloat(-expansion, expansion),
		t.MathUtils.randFloat(-expansion, expansion)
	));
	let created = Date.now();
	particles.dcData.onAfterPhysics.push(()=>{
		let time01 = (Date.now()-created)/lifetime;
		if(time01>1){
			g.dcWorld.remove(particles);
			return;
		}
		let xy = numX*numY*time01;
		let x = Math.floor(xy%numX)*scaleX;
		let y = 1-Math.floor(xy/numX)*scaleY;
		material.map.offset.set(x, y);
	});
	return particles;
}

export default effects;
