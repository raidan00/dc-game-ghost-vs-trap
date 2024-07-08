<script>
	import { onMount, onDestroy } from "svelte";
	import { DcWorld } from "dvijcock";
	import DcLogic from "./DcLogic.js";
	import Aim from "./Aim.svelte";
	import Shoot from "./Shoot.svelte";

	let domEl;
	let dc;
	onMount(async() => {
		dc = new DcWorld();
		dc.setDomElement(domEl);
		dc.setLogic(new DcLogic);
	});
	onDestroy(() => {
		dc.destroy();
	});
</script>

<div bind:this={domEl} class="game"></div>
<Aim />
<Shoot />

<style>
	.game {
		width: 100vw;
		height: 100vh;
		margin: 0px;
		top: 0px;
		left: 0px;
		position: fixed;
	}
</style>
