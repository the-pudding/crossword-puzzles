<script>
  import wordmark from "../svg/wordmark.svg";
  let visible = false;
</script>

<nav>
  <div class="wordmark">
    <a href="https://pudding.cool">{@html wordmark}</a>
  </div>
</nav>

<section id="intro">
  <h1>Crossword Puzzles</h1>
  <p>
    Below you will find playable mini-puzzles generated from the data behind
    <a href="https://pudding.cool/20202/11/crossword">our story</a>
    about inclusivity in crosswords. The ratio of the people referenced in the
    clues or answers reflect the findings of our analysis about racial and
    gender representation.
  </p>
  <div class="how">
    <p>
      <button on:click="{() => (visible = !visible)}">How were these made?</button>
    </p>
    <div class="method" class:visible>
      <p>
        TODO explain brief method, link to article. Explain that some of the
        clue wording was altered to fit outside of its original context.
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

  section p:first-of-type {
    font-size: 1.25em;
    text-align: justify;
  }

  .how {
    font-size: 0.7em;
  }

  .method {
    display: none;
    background-color: #efefef;
    padding: 0.25em 1em;
  }

  .method.visible {
    display: block;
  }
</style>
