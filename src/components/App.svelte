<script>
  import { onMount } from "svelte";
  import Meta from "./Meta.svelte";
  import Intro from "./Intro.svelte";
  import Play from "./Play.svelte";
  import Footer from "./Footer.svelte";
  import { puzzlesNYT, puzzlesToday } from "./../utils/loadData.js";
  import loadImage from "./../utils/loadImage.js";

  const gif = "https://pudding.cool/assets/img/custom.gif";
  const interval = 1000 * 60;
  let minutesOnPage;

  onMount(() => {
    minutesOnPage = 0;
    setInterval(() => {
      minutesOnPage += 1;
    }, interval);
  });

  $: if (typeof minutesOnPage === "number")
    loadImage(`${gif}?key=crossword&value=${minutesOnPage}`);
</script>

<Meta />
<Intro />

<article>
  <Play puzzles="{puzzlesToday}" title="Major Publications in 2020" />
  <Play puzzles="{puzzlesNYT}" title="New York Times by Decade" />
</article>

<Footer />

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

<style>
  article {
    padding: 0 1rem;
  }
  svg {
    height: 0;
    overflow: hidden;
    position: absolute;
  }
</style>
