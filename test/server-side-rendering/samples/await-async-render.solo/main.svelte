<script>
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve('42');
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