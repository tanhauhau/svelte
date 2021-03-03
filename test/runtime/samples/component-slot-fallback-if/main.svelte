<script>
	import Nested from "./Nested.svelte";
	export let condition;
</script>

<Nested>
	<svelte:fragment slot="bar">
		{#if condition}
			<div>{condition}</div>
		{/if}
	</svelte:fragment>
</Nested>
