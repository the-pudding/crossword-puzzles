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

  const puzzlesToday = [
    { id: "usa2020", value: "USA Today", data: usa2020 },
    { id: "up2020", value: "Universal", data: up2020 },
    { id: "nyt2020", value: "New York Times", data: nyt2020 },
    { id: "lat2020", value: "LA Times", data: lat2020 },
    { id: "wsj2020", value: "Wall Street Journal", data: wsj2020 },
  ];

  const puzzlesNYT = [
    { id: "nyt1940s", value: "1940s", data: nyt1940s },
    { id: "nyt1950s", value: "1950s", data: nyt1950s },
    { id: "nyt1960s", value: "1960s", data: nyt1960s },
    { id: "nyt1970s", value: "1970s", data: nyt1970s },
    { id: "nyt1980s", value: "1980s", data: nyt1980s },
    { id: "nyt1990s", value: "1990s", data: nyt1990s },
    { id: "nyt2000s", value: "2000s", data: nyt2000s },
    { id: "nyt2010s", value: "2010s", data: nyt2010s },
  ];
</script>

<Intro />

<article>
  <Play puzzles="{puzzlesToday}" title="Publications in 2020" />
  <Play puzzles="{puzzlesNYT}" title="New York Times by decade" />
</article>

<style>
</style>
