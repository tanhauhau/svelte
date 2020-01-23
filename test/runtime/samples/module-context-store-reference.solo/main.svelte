<script context="module">
	import { writable } from 'svelte/store';
	export const count = writable(0);

	export function getCount() {
		return $count;
	}
	export function setCount(val) {
		$count = val;
	}
</script>