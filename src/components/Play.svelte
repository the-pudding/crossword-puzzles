<script>
  import Crossword from "svelte-crossword";
  export let id;
  export let title;
  export let theme;
  export let puzzles = [];

  let current = puzzles[0].id;
  $: puzzle = puzzles.find((d) => d.id === current);
  $: name = puzzle.value;
  $: data = puzzle.data;
</script>

<section id="{id}" class="{theme}">
  <div class="info">
    <h2>{title}</h2>
    <select bind:value="{current}">
      {#each puzzles as { id, value }}
        <option value="{id}">{value}</option>
      {/each}
    </select>
  </div>

  <p class="insight">
    In our sample of people in
    {name}
    puzzles, we found that...
    <br />
    <button class="women"><span class="percent">10%</span> were women</button>
    and
    <br />
    <button class="urm"><span class="percent">30%</span>
      were underrepresented minorities</button>.
  </p>

  <div class="xd">
    <Crossword data="{data}" theme="{theme}" />
    <p class="note">
      <em>Note: findings are rounded to the nearest 10% for puzzle depiction
        purposes.</em>
    </p>
  </div>
</section>

<style>
  section {
    max-width: 960px;
    margin: 3em auto;
  }

  .citrus {
    background-color: azure;
  }

  .info {
    text-align: center;
  }

  h2 {
    font-size: 1.5em;
  }

  .xd {
    max-width: 800px;
    margin: 0 auto;
    font-family: --sans;
  }

  .insight {
    max-width: var(--column-width);
    margin: 0 auto;
    font-size: 1.25em;
  }

  span {
    font-weight: 700;
  }

  button {
    border: none;
    font-size: 1em;
    background: none;
    padding: 0;
  }
</style>
