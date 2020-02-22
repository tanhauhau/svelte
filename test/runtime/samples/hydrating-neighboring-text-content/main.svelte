<script>
  let count = 0;
</script>

<div>Count: {count} + {count} = {count * 2}</div>
<button on:click={() => count++}>Increment</button>