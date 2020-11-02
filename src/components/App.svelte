<script>
  import Intro from "./Intro.svelte";
  import Play from "./Play.svelte";

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

  import usa2020b from "../data/usa2020-2.json";
  import up2020b from "../data/up2020-2.json";
  import nyt2020b from "../data/nyt2020-2.json";
  import lat2020b from "../data/lat2020-2.json";

  import nyt1940sb from "../data/nyt1940s-2.json";
  import nyt1950sb from "../data/nyt1950s-2.json";
  import nyt1960sb from "../data/nyt1960s-2.json";
  import nyt1970sb from "../data/nyt1970s-2.json";
  import nyt1980sb from "../data/nyt1980s-2.json";
  import nyt1990sb from "../data/nyt1990s-2.json";
  import nyt2000sb from "../data/nyt2000s-2.json";

  import up2020c from "../data/up2020-3.json";
  import lat2020c from "../data/lat2020-3.json";

  import nyt1950sc from "../data/nyt1950s-3.json";
  import nyt1960sc from "../data/nyt1960s-3.json";
  import nyt1980sc from "../data/nyt1980s-3.json";

  let version = 0;

  $: v = +version;

  const puzzlesToday = [
    [
      { id: "usa2020", value: "USA Today", data: usa2020 },
      { id: "up2020", value: "Universal", data: up2020 },
      { id: "nyt2020", value: "New York Times", data: nyt2020 },
      { id: "lat2020", value: "LA Times", data: lat2020 },
      { id: "wsj2020", value: "Wall Street Journal", data: wsj2020 },
    ],
    [
      { id: "usa2020", value: "USA Today", data: usa2020b },
      { id: "up2020", value: "Universal", data: up2020b },
      { id: "nyt2020", value: "New York Times", data: nyt2020b },
      { id: "lat2020", value: "LA Times", data: lat2020b },
    ],
    [
      { id: "up2020", value: "Universal", data: up2020c },
      { id: "lat2020", value: "LA Times", data: lat2020c },
    ],
  ];

  const puzzlesNYT = [
    [
      { id: "nyt1940s", value: "1940s", data: nyt1940s },
      { id: "nyt1950s", value: "1950s", data: nyt1950s },
      { id: "nyt1960s", value: "1960s", data: nyt1960s },
      { id: "nyt1970s", value: "1970s", data: nyt1970s },
      { id: "nyt1980s", value: "1980s", data: nyt1980s },
      { id: "nyt1990s", value: "1990s", data: nyt1990s },
      { id: "nyt2000s", value: "2000s", data: nyt2000s },
      { id: "nyt2010s", value: "2010s", data: nyt2010s },
    ],
    [
      { id: "nyt1940s", value: "1940s", data: nyt1940sb },
      { id: "nyt1950s", value: "1950s", data: nyt1950sb },
      { id: "nyt1960s", value: "1960s", data: nyt1960sb },
      { id: "nyt1970s", value: "1970s", data: nyt1970sb },
      { id: "nyt1980s", value: "1980s", data: nyt1980sb },
      { id: "nyt1990s", value: "1990s", data: nyt1990sb },
      { id: "nyt2000s", value: "2000s", data: nyt2000sb },
    ],
    [
      { id: "nyt1950s", value: "1950s", data: nyt1950sc },
      { id: "nyt1960s", value: "1960s", data: nyt1960sc },
      { id: "nyt1980s", value: "1980s", data: nyt1980sc },
    ],
  ];
</script>

<Intro />

<div>
  <p>Version: {version}</p><input
    type="range"
    min="0"
    max="2"
    bind:value="{version}" />
</div>

<article>
  <Play puzzles="{puzzlesToday[v]}" title="Publications in 2020" />
  <Play puzzles="{puzzlesNYT[v]}" title="New York Times by decade" />
</article>

<style>
  div {
    text-align: center;
  }
</style>
