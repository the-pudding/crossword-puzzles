<script>
  import Crossword from "svelte-crossword";
  export let id;
  export let title;
  export let theme = "classic";
  export let puzzles = [];

  let current = puzzles[0].id;

  function addCustom(arr) {
    return arr.map((d) => ({
      ...d,
      custom: `${d.race} ${d.gender}`,
    }));
  }

  $: puzzle = puzzles.find((d) => d.id === current);
  $: name = puzzle.value;
  $: data = addCustom(puzzle.data);
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
    <button class="urm"><span class="percent">30%</span>
      were underrepresented minorities</button>
    and
    <button class="women"><span class="percent">10%</span> were women.</button>
  </p>

  <div class="xd">
    <Crossword data="{data}" theme="{theme}" />
    <p class="note">
      <em>Note: findings were rounded to the nearest 10% in order to map to the
        10 clues.</em>
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
    font-size: 2em;
  }

  .xd {
    max-width: 800px;
    margin: 0 auto;
    font-family: --sans;
  }

  .insight {
    max-width: var(--column-width);
    margin: 1em auto;
    font-size: 1em;
    line-height: 1.8;
  }

  span {
    font-weight: 700;
  }

  button {
    opacity: 0.5;
  }

  .note {
    max-width: 800px;
    font-family: var(--sans);
    text-align: right;
  }
</style>
