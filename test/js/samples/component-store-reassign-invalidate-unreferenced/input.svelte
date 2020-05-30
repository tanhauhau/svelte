<script>
	import { writable } from 'svelte/store';
	let foo = writable(0);
</script>

<button on:click="{() => foo = writable(0)}">reset</button>