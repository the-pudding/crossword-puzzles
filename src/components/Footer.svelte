<script>
  const v = Date.now();
  const url = `https://pudding.cool/assets/data/stories.json?v=${v}`;

  const fetchData = (async () => {
    const response = await fetch(url);
    return await response.json();
  })();
</script>

<footer>
  <h3>More stories from The Pudding</h3>
  {#await fetchData then data}
    {#each data.slice(0, 5) as { hed, url, image }}
      <p><a href="{url}">{hed}</a></p>
    {/each}
  {:catch error}
    <p>An error occurred!</p>
  {/await}
</footer>

<style>
  footer {
    background: #efefef;
    padding: 2rem 1rem;
    text-align: center;
  }
  h3 {
    font-size: 1.25em;
  }
  @media only screen and (min-width: 640px) {
    h3 {
      font-size: 1.5em;
    }
  }
</style>
