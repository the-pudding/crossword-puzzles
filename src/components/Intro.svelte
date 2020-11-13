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
    <h1>
      Play These Puzzles to Reveal the Racial and Gender Breakdown of Crosswords
    </h1>
    <p>
      Below you will find
      <strong>playable mini puzzles</strong>
      generated from the data behind
      <a href="https://pudding.cool/20202/11/crossword">our story</a>
      about inclusivity in crosswords. The number of people referenced reflect
      the findings from our analysis about racial and gender representation
      (e.g., a finding of 30% women means three clues will include women). We
      created these not only to share the results, but let you feel the
      difference in the puzzles.
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
          Goldenberg</a>,
        <a href="https://pudding.cool/author/michelle-mcghee">Michelle McGhee</a>,
        and
        <a href="https://pudding.cool/author/amelia-wattenberger">Amelia
          Wattenberger</a>. Data for these puzzles come from Saul Pwanson's
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

  .wordmark a {
    border: none;
  }
  .wordmark a:hover {
    background-color: transparent;
  }

  section {
    max-width: var(--column-width);
    margin: 0 auto;
    padding: 0 1rem;
  }

  h1 {
    font-size: 1.75em;
    display: none;
  }

  .info p {
    font-size: 1em;
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
    text-align: left;
  }

  @media only screen and (min-width: 700px) {
    section {
      padding: 0;
    }

    h1 {
      font-size: 2.5em;
      text-align: center;
    }

    .info p {
      font-size: 1.5em;
      text-align: justify;
    }
    .toggle {
      text-align: center;
    }
  }
</style>
