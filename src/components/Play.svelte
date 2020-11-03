<script>
  import Crossword from "svelte-crossword";
  export let id;
  export let title;
  export let theme = "classic";
  export let puzzles = [];

  let active;
  let revealed;
  let current;

  $: currentId = puzzles.find((d) => d.id === current)
    ? current
    : puzzles[0].id;
  $: puzzle = puzzles.find((d) => d.id === currentId);
  $: name = puzzle.value;
  $: data = addCustom(puzzle.data);
  $: percentURM = puzzle.urm;
  $: percentWoman = puzzle.woman;

  function addCustom(arr) {
    return arr.map((d) => ({
      ...d,
      custom: `${d.race} ${d.gender}`,
    }));
  }
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

  <p class="insight" class:revealed>
    The data analysis of people in
    {name}
    puzzles show that
    <br />
    <button
      class:active="{active === 'urm'}"
      class="urm"
      on:click="{() => (active = active === 'urm' ? null : 'urm')}"><span
        class="percent">{percentURM}</span>
      were underrepresented minorities</button>
    and
    <button
      class:active="{active === 'woman'}"
      class="woman"
      on:click="{() => (active = active === 'woman' ? null : 'woman')}"><span
        class="percent">{percentWoman}</span>
      were women.</button>
  </p>

  <div
    class="xd"
    class:revealed
    class:urm="{active === 'urm'}"
    class:woman="{active === 'woman'}">
    <Crossword
      data="{data}"
      theme="{theme}"
      disableHighlight="{true}"
      showCompleteMessage="{false}"
      bind:revealed />
    <p class="note">
      <em>Note: finding percentages were rounded to the nearest 10% in order to
        display 10 clues.</em>
    </p>
  </div>
</section>

<style>
  section {
    --xd-cell-text-font: var(--sans);
    --xd-clue-text-font: var(--sans);
    --xd-toolbar-text-font: var(--sans);
    max-width: 960px;
    margin: 3em auto;
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
    opacity: 0;
    pointer-events: none;
  }

  .insight.revealed {
    opacity: 1;
    pointer-events: auto;
  }

  span {
    font-weight: 700;
  }

  button {
    opacity: 1;
  }

  .note {
    max-width: 800px;
    font-family: var(--sans);
    text-align: right;
  }

  .active {
    opacity: 1;
  }

  .active.urm {
    background-color: var(--urm);
  }

  .active.woman {
    background-color: var(--woman);
  }
</style>
