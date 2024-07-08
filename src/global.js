import { writable } from 'svelte/store';

let global = {
	ammo: writable(10),
};
export default global;
