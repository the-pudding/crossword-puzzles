<script>
  import wordmark from "../svg/wordmark.svg";
  import left from "tabler-icons/icons/caret-left.svg";
  import down from "tabler-icons/icons/caret-down.svg";
  let visible = false;
</script>

<nav>
  <div class="wordmark">
    <a href="https://pudding.cool">{@html wordmark}</a>
  </div>
</nav>

<section id="intro">
  <div class="info">
    <h1>Crossword Puzzles</h1>
    <p>
      Below you will find playable mini puzzles generated from the data behind
      <a href="https://pudding.cool/20202/11/crossword">our story</a>
      about inclusivity in crosswords. The ratio of the people referenced in the
      clues or answers reflect the findings of our analysis about racial and
      gender representation.
    </p>
  </div>
  <div class="how">
    <p class="toggle">
      <button on:click="{() => (visible = !visible)}">How were these made?
        {#if visible}
          {@html down}
        {:else}
          {@html left}
        {/if}
      </button>
    </p>
    <div class="method" class:visible>
      <p>
        Made by
        <a href="https://pudding.cool/author/russell-goldenberg">Russell
          Goldenberg</a>
        and
        <a href="https://pudding.cool/author/michelle-mcghee">Michelle McGhee</a>.
        Data for these puzzles come from Saul Pwanson's
        <a href="http://xd.saul.pw/data/">crossword puzzle database</a>. A
        detailed explanation of the process can be found in the
        <a href="https://pudding.cool/20202/11/crossword#method">story</a>.
        Since we constructed mini puzzles with 10 clues, we had to round the
        findings to the nearest 10% to create a proper fit. For example, if the
        data has 74% women, it will create 7 of the 10 clues as women. Made with
        <a href="https://svelte.dev/">Svelte</a>
        and
        <a
          href="https://github.com/russellgoldenberg/svelte-crossword#svelte-crossword">svelte-crossword</a>.
      </p>
    </div>
  </div>
</section>

<style>
  .wordmark {
    max-width: 10em;
    margin: 1em auto;
  }

  section {
    max-width: var(--column-width);
    margin: 0 auto;
  }

  h1 {
    font-size: 2.5em;
    text-align: center;
  }

  .info p {
    font-size: 1.25em;
    text-align: justify;
  }

  .how {
    font-size: 0.8em;
  }

  .method {
    display: none;
    background-color: #efefef;
    padding: 0.25em 1em;
  }

  .method.visible {
    display: block;
  }

  .toggle {
    text-align: center;
  }
</style>
