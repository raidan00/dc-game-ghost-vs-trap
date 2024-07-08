<script>
	import aim from './assets/aim.png';
	import g from "./global.js";
	import { onDestroy } from 'svelte';

	let ammo;
	const unsubscribe = g.ammo.subscribe((value) => {
		ammo = value;
	});
	let stopped = false;
	onDestroy(()=>{
		unsubscribe();
		stopeed = true;
	});
	let ammoTimer = "";
	let lastUse = Date.now();
	let cooldown = 3000;
	function tick(){
		if(stopped)return;
		let diff = 1-(Date.now()-lastUse)/cooldown;
		if(diff<0){
			lastUse = Date.now();
			g.ammo.update((n) => n + 1);
		}
		let deg = 360*diff;
		ammoTimer = `background: conic-gradient(#45454585 ${deg}deg, #ffffff00 ${deg+1}deg); ${deg<0? "":"border:0px"}`;
		requestAnimationFrame(tick);
	}
	tick();
</script>
<div>
	 <img src={aim} alt="aim" />
	 <div class="ammo" style={ammoTimer}>{ammo}</div>
</div>
<style>
	div {
		width: 100vw;
		height: 100vh;
		margin: 0px;
		top: 0px;
		left: 0px;
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		user-select: none;
	}
	img {
		width: min(10vw, 10vh);
	}
	.ammo{
		left: 53vw;
		top: 53vh;
		width: min(5vw, 5vh);
		height: min(5vw, 5vh);
		border-radius: 50%;
	}
</style>
