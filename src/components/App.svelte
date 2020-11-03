<script>
  import Intro from "./Intro.svelte";
  import Play from "./Play.svelte";
  import { puzzlesNYT, puzzlesToday } from "./../utils/load-data.js";
</script>

<Intro />

<article>
  <Play puzzles="{puzzlesToday}" title="Publications in 2020" />
  <Play puzzles="{puzzlesNYT}" title="New York Times by decade" />
</article>

<svg>
  <defs>
    <pattern
      id="pattern-urm"
      x="0"
      y="0"
      width="1"
      height="1"
      patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="1" height="1" fill="#fff"></rect>
      <path d="M0 0 L 0 1 L 1 0 L 0 0" fill="#C63DA3"></path>
    </pattern>

    <pattern
      id="pattern-woman"
      x="0"
      y="0"
      width="1"
      height="1"
      patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="1" height="1" fill="#fff"></rect>
      <path d="M0 0 L 0 1 L 1 0 L 0 0" fill="#4864FE"></path>
    </pattern>
  </defs>
</svg>
