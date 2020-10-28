<script>
  import Crossword from "svelte-crossword";
  import usa2020 from "../data/usa2020-1.json";
  import up2020 from "../data/up2020-1.json";
  import nyt2020 from "../data/nyt2020-1.json";
  import lat2020 from "../data/lat2020-1.json";
  import wsj2020 from "../data/wsj2020-1.json";

  import nyt1940s from "../data/nyt1940s-1.json";
  import nyt1950s from "../data/nyt1950s-1.json";
  import nyt1960s from "../data/nyt1960s-1.json";
  import nyt1970s from "../data/nyt1970s-1.json";
  import nyt1980s from "../data/nyt1980s-1.json";
  import nyt1990s from "../data/nyt1990s-1.json";
  import nyt2000s from "../data/nyt2000s-1.json";
  import nyt2010s from "../data/nyt2010s-1.json";

  let currentT = "usa2020";
  let currentN = "nyt1940s";

  const puzzlesToday = [
    { id: "usa2020", pub: "USA Today", data: usa2020 },
    { id: "up2020", pub: "Universal", data: up2020 },
    { id: "nyt2020", pub: "New York Times", data: nyt2020 },
    { id: "lat2020", pub: "LA Times", data: lat2020 },
    { id: "wsj2020", pub: "Wall Street Journal", data: wsj2020 },
  ];

  const puzzlesNYT = [
    { id: "nyt1940s", decade: "1940s", data: nyt1940s },
    { id: "nyt1950s", decade: "1950s", data: nyt1950s },
    { id: "nyt1960s", decade: "1960s", data: nyt1960s },
    { id: "nyt1970s", decade: "1970s", data: nyt1970s },
    { id: "nyt1980s", decade: "1980s", data: nyt1980s },
    { id: "nyt1990s", decade: "1990s", data: nyt1990s },
    { id: "nyt2000s", decade: "2000s", data: nyt2000s },
    { id: "nyt2010s", decade: "2010s", data: nyt2010s },
  ];

  $: puzzleT = puzzlesToday.find((d) => d.id === currentT);
  $: puzzleN = puzzlesNYT.find((d) => d.id === currentN);
</script>

<div id="intro">
  <h1>Representative Crossword Puzzles</h1>
  <p>
    We published
    <a href="https://pudding.cool/2020/11/crossword">a story</a>
    about how inclusive crossword puzzles are, by the numbers, when it comes to
    racial and gender represntation. Below, you will find that data converted
    into playable puzzles. The people used in the clue and answers reflect the
    findings of our analysis.
  </p>
  <p><button>How were these made?</button></p>
</div>

<section id="today">
  <h2>Publications in 2020</h2>
  <p>Choose a publication</p>
  <select bind:value="{currentT}">
    {#each puzzlesToday as { id, pub }}
      <option value="{id}">{pub}</option>
    {/each}
  </select>

  <h3>{puzzleT.pub}</h3>

  <p class="insight">
    In the
    {puzzleT.pub}
    puzzles, we found that
    <span class="women"><span class="percent">10%</span>
      of people were women</span>
    and
    <span class="urm"><span class="percent">30%</span>
      were underrepresented minorities</span>.
  </p>

  <div class="xd">
    <Crossword data="{puzzleT.data}" />
    <p class="note">
      <em>Note: findings are rounded to the nearest 10% for puzzle depiction
        purposes.</em>
    </p>
  </div>
</section>

<section id="nyt">
  <h2>New York Times, through time</h2>
  <p>Choose a decade</p>
  <select bind:value="{currentN}">
    {#each puzzlesNYT as { id, decade }}
      <option value="{id}">{decade}</option>
    {/each}
  </select>

  <h3>{puzzleN.decade}</h3>

  <p class="insight">
    In the
    {puzzleN.decade}
    puzzles, we found that
    <span class="women"><span class="percent">10%</span>
      of people were women</span>
    and
    <span class="urm"><span class="percent">30%</span>
      were underrepresented minorities</span>.
  </p>

  <div class="xd">
    <Crossword data="{puzzleN.data}" />
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
    text-align: center;
  }
  #intro {
    max-width: 640px;
    margin: 0 auto;
  }
  #intro h1 {
    font-size: 2em;
  }
  #intro p {
    font-size: 1.5em;
  }
  h2 {
    font-size: 1.5em;
  }
  .xd {
    max-width: 720px;
    margin: 0 auto;
    font-family: Arial, Helvetica, sans-serif;
  }
</style>
