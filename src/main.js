import './app.css'
import App from './App.svelte'
import { loadModels } from "./models.js";
import { dcInit } from "dvijcock";

async function load(){
	await Promise.all([
		dcInit(),
		loadModels(),
	]);
	onLoadFinished();
	new App({
		target: document.getElementById('app'),
	})
}
load();

