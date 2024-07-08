import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const urls = import.meta.glob('./models/*.glb', {
	query: '?url',
	import: 'default',
});
const models = {};
export default models;

const loader = new GLTFLoader();
async function loadModel(val){
	let url = await val();
	let model = await loader.loadAsync(url);
	if(import.meta.env.MODE == "development"){
		models[url.match(/([A-Za-z0-9]+)\.glb+/)[1]] = model;
	}else{
		models[url.match(/([A-Za-z0-9]+)-[\w-]+\.glb+/)[1]] = model;
	}
}
export function loadModels(){
	let load = Object.values(urls).map(val=>loadModel(val));
	return Promise.all(load);
};
