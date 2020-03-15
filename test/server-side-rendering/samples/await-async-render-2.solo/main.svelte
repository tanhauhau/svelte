<script>
  const promise = new Promise((_, reject) => {
    setTimeout(() => {
      reject('oops');
    }, 500);
  })
</script>

{#await promise}
  <div>Loading...</div>
{:then result}
  <div>Result: {result}</div>
{:catch error}
  <div>Error: {error}</div>
{/await}