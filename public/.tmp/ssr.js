'use strict';

function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

var wordmark = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- Generator: Adobe Illustrator 22.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n<svg version=\"1.1\" id=\"wordmark\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t viewBox=\"0 0 192.6 50\" style=\"enable-background:new 0 0 192.6 50;\" xml:space=\"preserve\">\n<g>\n\t<path class=\"st0\" d=\"M150.1,9.5c1.5,0,2.8,1.3,2.8,2.8s-1.3,2.8-2.8,2.8s-2.8-1.3-2.8-2.8S148.6,9.5,150.1,9.5z\"/>\n\t<path class=\"st0\" d=\"M147.2,17.3h5.6v18.2h-5.6V17.3z\"/>\n\t<path class=\"st0\" d=\"M77.1,9.5h-1.9h-7v19.3v6.7h5.6v-6.7v-1.4h1.4h1.9c4.9,0,8.9-4,8.9-8.9S82.1,9.5,77.1,9.5z M77.1,21.8h-1.9\n\t\th-1.4v-1.4v-3.8v-1.4h1.4h1.9c1.8,0,3.3,1.5,3.3,3.3S79,21.8,77.1,21.8z\"/>\n\t<path class=\"st0\" d=\"M105.7,17.6h-5.6v8.9c0,1.8-1.5,3.3-3.3,3.3s-3.3-1.5-3.3-3.3v-8.9h-5.6v8.9c0,4.9,4,8.9,8.9,8.9\n\t\ts8.9-4,8.9-8.9V17.6z\"/>\n\t<path class=\"st0\" d=\"M164.1,17.6c-4.9,0-8.9,4-8.9,8.9v8.9h5.6v-8.9c0-1.8,1.5-3.3,3.3-3.3s3.3,1.5,3.3,3.3v8.9h5.6v-8.9\n\t\tC173,21.6,169,17.6,164.1,17.6z\"/>\n\t<path class=\"st0\" d=\"M119.7,16.2v1.4h-1.4h-1.9c-4.9,0-8.9,4-8.9,8.9s4,8.9,8.9,8.9h1.9h7V16.2V9.5l-5.6,3.3\n\t\tC119.7,12.8,119.7,16.2,119.7,16.2z M119.8,24.6v3.8v1.4h-1.4h-1.9c-1.8,0-3.3-1.5-3.3-3.3s1.5-3.3,3.3-3.3h1.9h1.4V24.6z\"/>\n\t<path class=\"st0\" d=\"M139.3,16.2v1.4h-1.4H136c-4.9,0-8.9,4-8.9,8.9s4,8.9,8.9,8.9h1.9h7V16.2V9.5l-5.6,3.3V16.2z M139.4,24.6v3.8\n\t\tv1.4h-1.5H136c-1.8,0-3.3-1.5-3.3-3.3s1.5-3.3,3.3-3.3h1.9h1.4v1.4H139.4z\"/>\n\t<path class=\"st0\" d=\"M183.7,17.6c-4.9,0-8.9,4-8.9,8.9s4,8.9,8.9,8.9h1.9h1.4v1.4v0.9v1.4v1.4c0,1.8-1.5,3.3-3.3,3.3\n\t\ts-3.3-1.5-3.3-3.3V38l-5.6,3.3c0.4,4.5,4.2,8.1,8.9,8.1c4.9,0,8.9-4,8.9-8.9v-1.4v-2.3V17.6h-7H183.7z M187,23.4v1.4v3.8V30h-1.4\n\t\th-1.9c-1.8,0-3.3-1.5-3.3-3.3s1.5-3.3,3.3-3.3h1.9C185.6,23.4,187,23.4,187,23.4z\"/>\n\t<path class=\"st0\" d=\"M28.6,17.6c-1.2,0-2.3,0.2-3.3,0.6V9.5l-5.6,3.3v13.7v2v6.9h5.6v-6.9l0,0v-2c0-1.8,1.5-3.3,3.3-3.3\n\t\ts3.3,1.5,3.3,3.3v8.9h5.6v-8.9C37.5,21.6,33.5,17.6,28.6,17.6z\"/>\n\t<path class=\"st0\" d=\"M17.8,9.5H0v5.6h6.1v20.3h5.6V15.1h6.1V9.5z\"/>\n\t<path class=\"st0\" d=\"M48.3,30.2c-0.4,0-1.2-0.1-1.8-0.4l5.2-2.1l5.6-2.3l-1-2.3l-0.1-0.2c-0.1-0.3-0.3-0.6-0.5-1\n\t\tc-0.1-0.1-0.1-0.2-0.2-0.3c0,0,0-0.1-0.1-0.1l-0.1-0.1l-0.1-0.1c-1.6-2.2-4-3.5-6.7-3.7l0,0h-0.6c-4.9,0-8.9,4-8.9,8.9\n\t\tc0,0.4,0,0.9,0.1,1.4l0,0V28c0,0,0,0,0,0.1c0,0,0,0,0,0.1c0,0.3,0.1,0.5,0.2,0.8v0.1v0.1c0.1,0.3,0.2,0.7,0.4,1v0.1v0.1\n\t\tc0.1,0.3,0.3,0.5,0.4,0.8c0,0.1,0.1,0.1,0.1,0.2l0,0c0.1,0.2,0.3,0.4,0.4,0.6c0,0,0,0,0,0.1c0,0,0,0.1,0.1,0.1l0.1,0.1\n\t\tc1.7,2.1,4.4,3.4,7.2,3.4h6.1v-5.2C54.5,30.2,50.6,30.2,48.3,30.2L48.3,30.2z M56.2,22.9L56.2,22.9L56.2,22.9z M44.6,25.7\n\t\tL44.6,25.7l-0.2,0.1c0.2-1.9,1.8-3.5,3.7-3.5c0.9,0,1.8,0.4,2.4,0.9L46.2,25L44.6,25.7L44.6,25.7z\"/>\n</g>\n</svg>";

/* src/components/Intro.svelte generated by Svelte v3.29.4 */

const css = {
	code: ".wordmark.svelte-skl6d2.svelte-skl6d2{max-width:10em;margin:1em auto}section.svelte-skl6d2.svelte-skl6d2{max-width:var(--column-width);margin:0 auto}h1.svelte-skl6d2.svelte-skl6d2{font-size:2.5em;text-align:center}section.svelte-skl6d2 p.svelte-skl6d2:first-of-type{font-size:1.25em;text-align:justify}.how.svelte-skl6d2.svelte-skl6d2{font-size:0.7em}.method.svelte-skl6d2.svelte-skl6d2{display:none;background-color:#efefef;padding:0.25em 1em}.method.visible.svelte-skl6d2.svelte-skl6d2{display:block}",
	map: "{\"version\":3,\"file\":\"Intro.svelte\",\"sources\":[\"Intro.svelte\"],\"sourcesContent\":[\"<script>\\n  import wordmark from \\\"../svg/wordmark.svg\\\";\\n  let visible = false;\\n</script>\\n\\n<nav>\\n  <div class=\\\"wordmark\\\">\\n    <a href=\\\"https://pudding.cool\\\">{@html wordmark}</a>\\n  </div>\\n</nav>\\n\\n<section id=\\\"intro\\\">\\n  <h1>Crossword Puzzles</h1>\\n  <p>\\n    Below you will find playable mini-puzzles generated from the data behind\\n    <a href=\\\"https://pudding.cool/20202/11/crossword\\\">our story</a>\\n    about inclusivity in crosswords. The ratio of the people referenced in the\\n    clues or answers reflect the findings of our analysis about racial and\\n    gender representation.\\n  </p>\\n  <div class=\\\"how\\\">\\n    <p>\\n      <button on:click=\\\"{() => (visible = !visible)}\\\">How were these made?</button>\\n    </p>\\n    <div class=\\\"method\\\" class:visible>\\n      <p>\\n        TODO explain brief method, link to article. Explain that some of the\\n        clue wording was altered to fit outside of its original context.\\n      </p>\\n    </div>\\n  </div>\\n</section>\\n\\n<style>\\n  .wordmark {\\n    max-width: 10em;\\n    margin: 1em auto;\\n  }\\n\\n  section {\\n    max-width: var(--column-width);\\n    margin: 0 auto;\\n  }\\n\\n  h1 {\\n    font-size: 2.5em;\\n    text-align: center;\\n  }\\n\\n  section p:first-of-type {\\n    font-size: 1.25em;\\n    text-align: justify;\\n  }\\n\\n  .how {\\n    font-size: 0.7em;\\n  }\\n\\n  .method {\\n    display: none;\\n    background-color: #efefef;\\n    padding: 0.25em 1em;\\n  }\\n\\n  .method.visible {\\n    display: block;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAkCE,SAAS,4BAAC,CAAC,AACT,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,GAAG,CAAC,IAAI,AAClB,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AAED,EAAE,4BAAC,CAAC,AACF,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,MAAM,AACpB,CAAC,AAED,qBAAO,CAAC,eAAC,cAAc,AAAC,CAAC,AACvB,SAAS,CAAE,MAAM,CACjB,UAAU,CAAE,OAAO,AACrB,CAAC,AAED,IAAI,4BAAC,CAAC,AACJ,SAAS,CAAE,KAAK,AAClB,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,OAAO,CAAE,IAAI,CACb,gBAAgB,CAAE,OAAO,CACzB,OAAO,CAAE,MAAM,CAAC,GAAG,AACrB,CAAC,AAED,OAAO,QAAQ,4BAAC,CAAC,AACf,OAAO,CAAE,KAAK,AAChB,CAAC\"}"
};

const Intro = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css);

	return `<nav><div class="${"wordmark svelte-skl6d2"}"><a href="${"https://pudding.cool"}">${wordmark}</a></div></nav>

<section id="${"intro"}" class="${"svelte-skl6d2"}"><h1 class="${"svelte-skl6d2"}">Crossword Puzzles</h1>
  <p class="${"svelte-skl6d2"}">Below you will find playable mini-puzzles generated from the data behind
    <a href="${"https://pudding.cool/20202/11/crossword"}">our story</a>
    about inclusivity in crosswords. The ratio of the people referenced in the
    clues or answers reflect the findings of our analysis about racial and
    gender representation.
  </p>
  <div class="${"how svelte-skl6d2"}"><p class="${"svelte-skl6d2"}"><button>How were these made?</button></p>
    <div class="${["method svelte-skl6d2",  ""].join(" ").trim()}"><p class="${"svelte-skl6d2"}">TODO explain brief method, link to article. Explain that some of the
        clue wording was altered to fit outside of its original context.
      </p></div></div>
</section>`;
});

/* node_modules/svelte-crossword/src/Toolbar.svelte generated by Svelte v3.29.4 */

const css$1 = {
	code: ".toolbar.svelte-18y41o8{margin-bottom:1em;padding:1em 0;display:flex;justify-content:flex-end;font-family:var(--toolbar-text-font);font-size:var(--toolbar-text-size);background-color:var(--toolbar-bg)}button.svelte-18y41o8{cursor:pointer;margin-left:1em;font-size:1em;background-color:var(--toolbar-button-bg);border-radius:var(--toolbar-button-border-radius);color:var(--toolbar-button-color);padding:var(--toolbar-button-padding);border:var(--toolbar-button-border);font-weight:var(--toolbar-button-text-weight);transition:background-color 150ms}button.svelte-18y41o8:hover{background-color:var(--toolbar-button-bg-hover)}",
	map: "{\"version\":3,\"file\":\"Toolbar.svelte\",\"sources\":[\"Toolbar.svelte\"],\"sourcesContent\":[\"<script>\\n  import { createEventDispatcher } from \\\"svelte\\\";\\n  const dispatch = createEventDispatcher();\\n\\n  export let actions = [\\\"clear\\\", \\\"reveal\\\"];\\n</script>\\n\\n<div class=\\\"toolbar\\\">\\n  {#each actions as action}\\n    {#if action == 'clear'}\\n      <button on:click=\\\"{() => dispatch('event', 'clear')}\\\">Clear</button>\\n    {:else if action == 'reveal'}\\n      <button on:click=\\\"{() => dispatch('event', 'reveal')}\\\">Reveal</button>\\n    {/if}\\n  {/each}\\n</div>\\n\\n<style>\\n  .toolbar {\\n    margin-bottom: 1em;\\n    padding: 1em 0;\\n    display: flex;\\n    justify-content: flex-end;\\n    font-family: var(--toolbar-text-font);\\n    font-size: var(--toolbar-text-size);\\n    background-color: var(--toolbar-bg);\\n  }\\n  button {\\n    cursor: pointer;\\n    margin-left: 1em;\\n    font-size: 1em;\\n    background-color: var(--toolbar-button-bg);\\n    border-radius: var(--toolbar-button-border-radius);\\n    color: var(--toolbar-button-color);\\n    padding: var(--toolbar-button-padding);\\n    border: var(--toolbar-button-border);\\n    font-weight: var(--toolbar-button-text-weight);\\n    transition: background-color 150ms;\\n  }\\n  button:hover {\\n    background-color: var(--toolbar-button-bg-hover);\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAkBE,QAAQ,eAAC,CAAC,AACR,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CAAC,CAAC,CACd,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,QAAQ,CACzB,WAAW,CAAE,IAAI,mBAAmB,CAAC,CACrC,SAAS,CAAE,IAAI,mBAAmB,CAAC,CACnC,gBAAgB,CAAE,IAAI,YAAY,CAAC,AACrC,CAAC,AACD,MAAM,eAAC,CAAC,AACN,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,GAAG,CACd,gBAAgB,CAAE,IAAI,mBAAmB,CAAC,CAC1C,aAAa,CAAE,IAAI,8BAA8B,CAAC,CAClD,KAAK,CAAE,IAAI,sBAAsB,CAAC,CAClC,OAAO,CAAE,IAAI,wBAAwB,CAAC,CACtC,MAAM,CAAE,IAAI,uBAAuB,CAAC,CACpC,WAAW,CAAE,IAAI,4BAA4B,CAAC,CAC9C,UAAU,CAAE,gBAAgB,CAAC,KAAK,AACpC,CAAC,AACD,qBAAM,MAAM,AAAC,CAAC,AACZ,gBAAgB,CAAE,IAAI,yBAAyB,CAAC,AAClD,CAAC\"}"
};

const Toolbar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();
	let { actions = ["clear", "reveal"] } = $$props;
	if ($$props.actions === void 0 && $$bindings.actions && actions !== void 0) $$bindings.actions(actions);
	$$result.css.add(css$1);

	return `<div class="${"toolbar svelte-18y41o8"}">${each(actions, action => `${action == "clear"
	? `<button class="${"svelte-18y41o8"}">Clear</button>`
	: `${action == "reveal"
		? `<button class="${"svelte-18y41o8"}">Reveal</button>`
		: ``}`}`)}
</div>`;
});

var keyboardData = [{
	"row": 0,
	"value": "Q"
}, {
	"row": 0,
	"value": "W"
}, {
	"row": 0,
	"value": "E"
}, {
	"row": 0,
	"value": "R"
}, {
	"row": 0,
	"value": "T"
}, {
	"row": 0,
	"value": "Y"
}, {
	"row": 0,
	"value": "U"
},  {
	"row": 0,
	"value": "I"
},  {
	"row": 0,
	"value": "O"
},  {
	"row": 0,
	"value": "P"
}, {
	"row": 1,
	"value": "A"
}, {
	"row": 1,
	"value": "S"
}, {
	"row": 1,
	"value": "D"
}, {
	"row": 1,
	"value": "F"
}, {
	"row": 1,
	"value": "G"
}, {
	"row": 1,
	"value": "H"
}, {
	"row": 1,
	"value": "J"
}, {
	"row": 1,
	"value": "K"
}, {
	"row": 1,
	"value": "L"
}, {
	"row": 2,
	"value": "123"
}, {
	"row": 2,
	"value": "Z"
}, {
	"row": 2,
	"value": "X"
}, {
	"row": 2,
	"value": "C"
}, {
	"row": 2,
	"value": "V"
}, {
	"row": 2,
	"value": "B"
}, {
	"row": 2,
	"value": "N"
}, {
	"row": 2,
	"value": "M"
}, {
	"row": 2,
	"value": "delete"
}
 ];

/* node_modules/svelte-keyboard/src/Keyboard.svelte generated by Svelte v3.29.4 */

const css$2 = {
	code: ".row.svelte-whq6fn{display:flex;justify-content:center}button.svelte-whq6fn{font-size:1em;text-align:center;padding:0.5em;margin:0.1em;border-radius:2px;background-color:#efefef;border:none;outline:none;cursor:pointer;line-height:1;vertical-align:baseline}button.svelte-whq6fn:active{transform:scale(2);background-color:#cdcdcd}button.single.svelte-whq6fn{padding:0.5em 0}",
	map: "{\"version\":3,\"file\":\"Keyboard.svelte\",\"sources\":[\"Keyboard.svelte\"],\"sourcesContent\":[\"<script>\\n  import { createEventDispatcher } from \\\"svelte\\\";\\n  import keyboardData from \\\"./data.js\\\";\\n  const dispatch = createEventDispatcher();\\n\\n  export let data = keyboardData;\\n\\n  const unique = (arr) => [...new Set(arr)];\\n  const rows = unique(data.map((d) => d.row));\\n  rows.sort((a, b) => a - b);\\n\\n  const swaps = {\\n    delete:\\n      '<svg width=\\\"1em\\\" height=\\\"1em\\\" viewBox=\\\"0 0 24 24\\\" fill=\\\"none\\\" stroke=\\\"currentColor\\\" stroke-width=\\\"2\\\" stroke-linecap=\\\"round\\\" stroke-linejoin=\\\"round\\\" class=\\\"feather feather-delete\\\"><path d=\\\"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z\\\"></path><line x1=\\\"18\\\" y1=\\\"9\\\" x2=\\\"12\\\" y2=\\\"15\\\"></line><line x1=\\\"12\\\" y1=\\\"9\\\" x2=\\\"18\\\" y2=\\\"15\\\"></line></svg>',\\n  };\\n\\n  $: rowData = rows.map((r) => data.filter((k) => k.row === r));\\n  $: maxInRow = Math.max(...rowData.map((r) => r.length));\\n  $: percentWidth = `${(1 / maxInRow) * 100}%`;\\n\\n  function onKey() {\\n    const value = this.innerText;\\n    dispatch(\\\"keydown\\\", value);\\n  }\\n</script>\\n\\n<style>\\n  .row {\\n    display: flex;\\n    justify-content: center;\\n  }\\n\\n  button {\\n    font-size: 1em;\\n    text-align: center;\\n    padding: 0.5em;\\n    margin: 0.1em;\\n    border-radius: 2px;\\n    background-color: #efefef;\\n    border: none;\\n    outline: none;\\n    cursor: pointer;\\n    line-height: 1;\\n    vertical-align: baseline;\\n  }\\n\\n  button:active {\\n    transform: scale(2);\\n    background-color: #cdcdcd;\\n  }\\n\\n  button.single {\\n    padding: 0.5em 0;\\n  }</style>\\n\\n<div class=\\\"keyboard\\\">\\n  {#each rowData as keys}\\n    <div class=\\\"row\\\">\\n      {#each keys as { value }}\\n        <button\\n          style=\\\"width: {value.length === 1 ? percentWidth : 'auto'};\\\"\\n          class:single={value.length === 1}\\n          on:touchstart={() => dispatch('keydown', value)}\\n          on:click={() => dispatch('keydown', value)}>\\n          {#if swaps[value]}\\n            {@html swaps[value]}\\n          {:else}{value}{/if}\\n        </button>\\n      {/each}\\n    </div>\\n  {/each}\\n</div>\\n\"],\"names\":[],\"mappings\":\"AA2BE,IAAI,cAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,AACzB,CAAC,AAED,MAAM,cAAC,CAAC,AACN,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,GAAG,CAClB,gBAAgB,CAAE,OAAO,CACzB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,CAAC,CACd,cAAc,CAAE,QAAQ,AAC1B,CAAC,AAED,oBAAM,OAAO,AAAC,CAAC,AACb,SAAS,CAAE,MAAM,CAAC,CAAC,CACnB,gBAAgB,CAAE,OAAO,AAC3B,CAAC,AAED,MAAM,OAAO,cAAC,CAAC,AACb,OAAO,CAAE,KAAK,CAAC,CAAC,AAClB,CAAC\"}"
};

const Keyboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();
	let { data = keyboardData } = $$props;
	const unique = arr => [...new Set(arr)];
	const rows = unique(data.map(d => d.row));
	rows.sort((a, b) => a - b);

	const swaps = {
		delete: "<svg width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-delete\"><path d=\"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z\"></path><line x1=\"18\" y1=\"9\" x2=\"12\" y2=\"15\"></line><line x1=\"12\" y1=\"9\" x2=\"18\" y2=\"15\"></line></svg>"
	};

	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	$$result.css.add(css$2);
	let rowData;
	let maxInRow;
	let percentWidth;
	rowData = rows.map(r => data.filter(k => k.row === r));
	maxInRow = Math.max(...rowData.map(r => r.length));
	percentWidth = `${1 / maxInRow * 100}%`;

	return `<div class="${"keyboard"}">${each(rowData, keys => `<div class="${"row svelte-whq6fn"}">${each(keys, ({ value }) => `<button style="${"width: " + escape(value.length === 1 ? percentWidth : "auto") + ";"}" class="${["svelte-whq6fn", value.length === 1 ? "single" : ""].join(" ").trim()}">${swaps[value] ? `${swaps[value]}` : `${escape(value)}`}
        </button>`)}
    </div>`)}</div>`;
});

var getSecondarilyFocusedCells = ({ cells, focusedDirection, focusedCell }) => {
  const dimension = focusedDirection == "across" ? "x" : "y";
  const otherDimension = focusedDirection == "across" ? "y" : "x";
  const start = focusedCell[dimension];

  const cellsWithDiff = cells
    .filter(
      (cell) =>
        // take out cells in other columns/rows
        cell[otherDimension] == focusedCell[otherDimension]
    )
    .map((cell) => ({
      ...cell,
      // how far is this cell from our focused cell?
      diff: start - cell[dimension],
    }));
    
	cellsWithDiff.sort((a, b) => a.diff - b.diff);

  // highlight all cells in same row/column, without any breaks
  const diffs = cellsWithDiff.map((d) => d.diff);
  const indices = range(Math.min(...diffs), Math.max(...diffs)).map((i) =>
    diffs.includes(i) ? i : " "
  );
  const chunks = indices.join(",").split(", ,");
  const currentChunk = (
    chunks.find(
      (d) => d.startsWith("0,") || d.endsWith(",0") || d.includes(",0,")
    ) || ""
  )
    .split(",")
    .map((d) => +d);

  const secondarilyFocusedCellIndices = cellsWithDiff
    .filter((cell) => currentChunk.includes(cell.diff))
    .map((cell) => cell.index);
  return secondarilyFocusedCellIndices;
};

const range = (min, max) =>
  Array.from({ length: max - min + 1 }, (v, k) => k + min);

var getCellAfterDiff = ({ diff, cells, direction, focusedCell }) => {
  const dimension = direction == "across" ? "x" : "y";
  const otherDimension = direction == "across" ? "y" : "x";
  const start = focusedCell[dimension];
  const absDiff = Math.abs(diff);
  const isDiffNegative = diff < 0;

  const cellsWithDiff = cells
    .filter(
      (cell) =>
        // take out cells in other columns/rows
        cell[otherDimension] == focusedCell[otherDimension] &&
        // take out cells in wrong direction
        (isDiffNegative ? cell[dimension] < start : cell[dimension] > start)
    )
    .map((cell) => ({
      ...cell,
      // how far is this cell from our focused cell?
      absDiff: Math.abs(start - cell[dimension]),
    }));

  cellsWithDiff.sort((a, b) => a.absDiff - b.absDiff);
  return cellsWithDiff[absDiff - 1];
};

function checkMobile() {
	const devices = {
		android: () => navigator.userAgent.match(/Android/i),

		blackberry: () => navigator.userAgent.match(/BlackBerry/i),

		ios: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),

		opera: () => navigator.userAgent.match(/Opera Mini/i),

		windows: () => navigator.userAgent.match(/IEMobile/i),
	};

	return devices.android() ||
		devices.blackberry() ||
		devices.ios() ||
		devices.opera() ||
		devices.windows();
}

/* node_modules/svelte-crossword/src/Cell.svelte generated by Svelte v3.29.4 */

const css$3 = {
	code: "g.svelte-1beradn.svelte-1beradn{cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}g.svelte-1beradn.svelte-1beradn:focus{outline:none}g.is-secondarily-focused.svelte-1beradn rect.svelte-1beradn{fill:var(--secondary-color)}g.is-focused.svelte-1beradn rect.svelte-1beradn{fill:var(--highlight-color)}rect.svelte-1beradn.svelte-1beradn{transition:fill 0.1s ease-out}text.svelte-1beradn.svelte-1beradn{pointer-events:none;line-height:1;font-family:var(--cell-text-font);fill:var(--cell-text-color)}.value.svelte-1beradn.svelte-1beradn{font-size:var(--cell-text-size);font-weight:var(--cell-text-weight)}.number.svelte-1beradn.svelte-1beradn{font-size:var(--number-text-size);font-weight:var(--number-text-weight);fill:var(--number-text-color)}rect.svelte-1beradn.svelte-1beradn{fill:var(--cell-bg-color);stroke:var(--cell-border-color);stroke-width:var(--cell-border-width)}",
	map: "{\"version\":3,\"file\":\"Cell.svelte\",\"sources\":[\"Cell.svelte\"],\"sourcesContent\":[\"<script>\\n  export let x;\\n  export let y;\\n  export let value;\\n  export let number;\\n  export let index;\\n  export let custom;\\n  export let changeDelay = 0;\\n  export let isRevealing = false;\\n  export let isFocused = false;\\n  export let isSecondarilyFocused = false;\\n  export let onFocusCell = () => {};\\n  export let onCellUpdate = () => {};\\n  export let onFocusClueDiff = () => {};\\n  export let onMoveFocus = () => {};\\n  export let onFlipDirection = () => {};\\n  export let onHistoricalChange = () => {};\\n\\n  let element;\\n\\n  function onFocusSelf() {\\n    if (!element) return;\\n    if (isFocused) element.focus();\\n  }\\n\\n  $: isFocused, onFocusSelf();\\n\\n  function onKeydown(e) {\\n    if (e.ctrlKey && e.key.toLowerCase() == \\\"z\\\") {\\n      onHistoricalChange(e.shiftKey ? 1 : -1);\\n    }\\n\\n    if (e.ctrlKey) return;\\n    if (e.altKey) return;\\n\\n    if (e.key === \\\"Tab\\\") {\\n      onFocusClueDiff(e.shiftKey ? -1 : 1);\\n      e.preventDefault();\\n      e.stopPropagation();\\n      return;\\n    }\\n\\n    if (e.key == \\\" \\\") {\\n      onFlipDirection();\\n      e.preventDefault();\\n      e.stopPropagation();\\n      return;\\n    }\\n\\n    if ([\\\"Delete\\\", \\\"Backspace\\\"].includes(e.key)) {\\n      onCellUpdate(index, \\\"\\\", -1);\\n      return;\\n    }\\n\\n    const isKeyInAlphabet = /^[a-zA-Z()]$/.test(e.key);\\n    if (isKeyInAlphabet) {\\n      onCellUpdate(index, e.key.toUpperCase());\\n      return;\\n    }\\n\\n    const diff = {\\n      ArrowLeft: [\\\"across\\\", -1],\\n      ArrowRight: [\\\"across\\\", 1],\\n      ArrowUp: [\\\"down\\\", -1],\\n      ArrowDown: [\\\"down\\\", 1],\\n    }[e.key];\\n    if (diff) {\\n      onMoveFocus(...diff);\\n      e.preventDefault();\\n      e.stopPropagation();\\n      return;\\n    }\\n  }\\n\\n  function onClick() {\\n    onFocusCell(index);\\n  }\\n\\n  function pop(node, { delay = 0, duration = 250 }) {\\n    return {\\n      delay,\\n      duration,\\n      css: (t) =>\\n        [\\n          `transform: translate(0, ${1 - t}px)`, //\\n        ].join(\\\";\\\"),\\n    };\\n  }\\n</script>\\n\\n<!-- <svelte:window on:keydown={onKeydown} /> -->\\n\\n<g\\n  class=\\\"cell {custom}\\\"\\n  class:is-focused=\\\"{isFocused}\\\"\\n  class:is-secondarily-focused=\\\"{isSecondarilyFocused}\\\"\\n  transform=\\\"{`translate(${x}, ${y})`}\\\"\\n  id=\\\"cell-{x}-{y}\\\"\\n  tabIndex=\\\"0\\\"\\n  on:click=\\\"{onClick}\\\"\\n  on:keydown=\\\"{onKeydown}\\\"\\n  bind:this=\\\"{element}\\\">\\n  <rect width=\\\"1\\\" height=\\\"1\\\"></rect>\\n  {#if value}\\n    <text\\n      transition:pop=\\\"{{ y: 5, delay: changeDelay, duration: isRevealing ? 250 : 0 }}\\\"\\n      class=\\\"value\\\"\\n      x=\\\"0.5\\\"\\n      y=\\\"0.9\\\"\\n      dominant-baseline=\\\"auto\\\"\\n      text-anchor=\\\"middle\\\">\\n      {value}\\n    </text>\\n  {/if}\\n  <text\\n    class=\\\"number\\\"\\n    x=\\\"0.1\\\"\\n    y=\\\"0.1\\\"\\n    dominant-baseline=\\\"hanging\\\"\\n    text-anchor=\\\"start\\\">\\n    {number}\\n  </text>\\n</g>\\n\\n<style>\\n  g {\\n    cursor: pointer;\\n    -webkit-user-select: none;\\n       -moz-user-select: none;\\n        -ms-user-select: none;\\n            user-select: none;\\n  }\\n\\n  g:focus {\\n    outline: none;\\n  }\\n\\n  g.is-secondarily-focused rect {\\n    fill: var(--secondary-color);\\n  }\\n\\n  g.is-focused rect {\\n    fill: var(--highlight-color);\\n  }\\n\\n  rect {\\n    transition: fill 0.1s ease-out;\\n  }\\n\\n  text {\\n    pointer-events: none;\\n    line-height: 1;\\n    font-family: var(--cell-text-font);\\n    fill: var(--cell-text-color);\\n  }\\n\\n  .value {\\n    font-size: var(--cell-text-size);\\n    font-weight: var(--cell-text-weight);\\n  }\\n\\n  .number {\\n    font-size: var(--number-text-size);\\n    font-weight: var(--number-text-weight);\\n    fill: var(--number-text-color);\\n  }\\n\\n  rect {\\n    fill: var(--cell-bg-color);\\n    stroke: var(--cell-border-color);\\n    stroke-width: var(--cell-border-width);\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AA6HE,CAAC,8BAAC,CAAC,AACD,MAAM,CAAE,OAAO,CACf,mBAAmB,CAAE,IAAI,CACtB,gBAAgB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CACjB,WAAW,CAAE,IAAI,AAC3B,CAAC,AAED,+BAAC,MAAM,AAAC,CAAC,AACP,OAAO,CAAE,IAAI,AACf,CAAC,AAED,CAAC,sCAAuB,CAAC,IAAI,eAAC,CAAC,AAC7B,IAAI,CAAE,IAAI,iBAAiB,CAAC,AAC9B,CAAC,AAED,CAAC,0BAAW,CAAC,IAAI,eAAC,CAAC,AACjB,IAAI,CAAE,IAAI,iBAAiB,CAAC,AAC9B,CAAC,AAED,IAAI,8BAAC,CAAC,AACJ,UAAU,CAAE,IAAI,CAAC,IAAI,CAAC,QAAQ,AAChC,CAAC,AAED,IAAI,8BAAC,CAAC,AACJ,cAAc,CAAE,IAAI,CACpB,WAAW,CAAE,CAAC,CACd,WAAW,CAAE,IAAI,gBAAgB,CAAC,CAClC,IAAI,CAAE,IAAI,iBAAiB,CAAC,AAC9B,CAAC,AAED,MAAM,8BAAC,CAAC,AACN,SAAS,CAAE,IAAI,gBAAgB,CAAC,CAChC,WAAW,CAAE,IAAI,kBAAkB,CAAC,AACtC,CAAC,AAED,OAAO,8BAAC,CAAC,AACP,SAAS,CAAE,IAAI,kBAAkB,CAAC,CAClC,WAAW,CAAE,IAAI,oBAAoB,CAAC,CACtC,IAAI,CAAE,IAAI,mBAAmB,CAAC,AAChC,CAAC,AAED,IAAI,8BAAC,CAAC,AACJ,IAAI,CAAE,IAAI,eAAe,CAAC,CAC1B,MAAM,CAAE,IAAI,mBAAmB,CAAC,CAChC,YAAY,CAAE,IAAI,mBAAmB,CAAC,AACxC,CAAC\"}"
};

const Cell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { x } = $$props;
	let { y } = $$props;
	let { value } = $$props;
	let { number } = $$props;
	let { index } = $$props;
	let { custom } = $$props;
	let { changeDelay = 0 } = $$props;
	let { isRevealing = false } = $$props;
	let { isFocused = false } = $$props;
	let { isSecondarilyFocused = false } = $$props;

	let { onFocusCell = () => {
		
	} } = $$props;

	let { onCellUpdate = () => {
		
	} } = $$props;

	let { onFocusClueDiff = () => {
		
	} } = $$props;

	let { onMoveFocus = () => {
		
	} } = $$props;

	let { onFlipDirection = () => {
		
	} } = $$props;

	let { onHistoricalChange = () => {
		
	} } = $$props;

	let element;

	if ($$props.x === void 0 && $$bindings.x && x !== void 0) $$bindings.x(x);
	if ($$props.y === void 0 && $$bindings.y && y !== void 0) $$bindings.y(y);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.number === void 0 && $$bindings.number && number !== void 0) $$bindings.number(number);
	if ($$props.index === void 0 && $$bindings.index && index !== void 0) $$bindings.index(index);
	if ($$props.custom === void 0 && $$bindings.custom && custom !== void 0) $$bindings.custom(custom);
	if ($$props.changeDelay === void 0 && $$bindings.changeDelay && changeDelay !== void 0) $$bindings.changeDelay(changeDelay);
	if ($$props.isRevealing === void 0 && $$bindings.isRevealing && isRevealing !== void 0) $$bindings.isRevealing(isRevealing);
	if ($$props.isFocused === void 0 && $$bindings.isFocused && isFocused !== void 0) $$bindings.isFocused(isFocused);
	if ($$props.isSecondarilyFocused === void 0 && $$bindings.isSecondarilyFocused && isSecondarilyFocused !== void 0) $$bindings.isSecondarilyFocused(isSecondarilyFocused);
	if ($$props.onFocusCell === void 0 && $$bindings.onFocusCell && onFocusCell !== void 0) $$bindings.onFocusCell(onFocusCell);
	if ($$props.onCellUpdate === void 0 && $$bindings.onCellUpdate && onCellUpdate !== void 0) $$bindings.onCellUpdate(onCellUpdate);
	if ($$props.onFocusClueDiff === void 0 && $$bindings.onFocusClueDiff && onFocusClueDiff !== void 0) $$bindings.onFocusClueDiff(onFocusClueDiff);
	if ($$props.onMoveFocus === void 0 && $$bindings.onMoveFocus && onMoveFocus !== void 0) $$bindings.onMoveFocus(onMoveFocus);
	if ($$props.onFlipDirection === void 0 && $$bindings.onFlipDirection && onFlipDirection !== void 0) $$bindings.onFlipDirection(onFlipDirection);
	if ($$props.onHistoricalChange === void 0 && $$bindings.onHistoricalChange && onHistoricalChange !== void 0) $$bindings.onHistoricalChange(onHistoricalChange);
	$$result.css.add(css$3);

	return `

<g class="${[
		"cell " + escape(custom) + " svelte-1beradn",
		(isFocused ? "is-focused" : "") + " " + (isSecondarilyFocused ? "is-secondarily-focused" : "")
	].join(" ").trim()}"${add_attribute("transform", `translate(${x}, ${y})`, 0)} id="${"cell-" + escape(x) + "-" + escape(y)}" tabIndex="${"0"}"${add_attribute("this", element, 1)}><rect width="${"1"}" height="${"1"}" class="${"svelte-1beradn"}"></rect>${value
	? `<text class="${"value svelte-1beradn"}" x="${"0.5"}" y="${"0.9"}" dominant-baseline="${"auto"}" text-anchor="${"middle"}">${escape(value)}</text>`
	: ``}<text class="${"number svelte-1beradn"}" x="${"0.1"}" y="${"0.1"}" dominant-baseline="${"hanging"}" text-anchor="${"start"}">${escape(number)}</text></g>`;
});

/* node_modules/svelte-crossword/src/Puzzle.svelte generated by Svelte v3.29.4 */

const css$4 = {
	code: "section.svelte-14mrlya{position:-webkit-sticky;position:sticky;top:1em;order:0;flex:1;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content}section.stacked.svelte-14mrlya{position:relative;top:auto;height:auto;order:-1}svg.svelte-14mrlya{display:block;font-size:1px;background:var(--cell-void-color);border:4px solid var(--puzzle-border-color)}.keyboard.svelte-14mrlya{order:3}",
	map: "{\"version\":3,\"file\":\"Puzzle.svelte\",\"sources\":[\"Puzzle.svelte\"],\"sourcesContent\":[\"<script>\\n  import { onMount } from \\\"svelte\\\";\\n  import Keyboard from \\\"svelte-keyboard\\\";\\n  import getSecondarilyFocusedCells from \\\"./helpers/getSecondarilyFocusedCells.js\\\";\\n  import getCellAfterDiff from \\\"./helpers/getCellAfterDiff.js\\\";\\n  import checkMobile from \\\"./helpers/checkMobile.js\\\";\\n\\n  import Cell from \\\"./Cell.svelte\\\";\\n\\n  export let clues;\\n  export let cells;\\n  export let focusedDirection;\\n  export let focusedCellIndex;\\n  export let focusedCell;\\n  export let isRevealing;\\n  export let isDisableHighlight;\\n  export let stacked;\\n  export let revealDuration = 0;\\n  export let showKeyboard;\\n\\n  let cellsHistoryIndex = 0;\\n  let cellsHistory = [];\\n  let focusedCellIndexHistoryIndex = 0;\\n  let focusedCellIndexHistory = [];\\n  let secondarilyFocusedCells = [];\\n  let isMobile = false;\\n\\n  const numberOfStatesInHistory = 10;\\n  $: w = Math.max(...cells.map((d) => d.x)) + 1;\\n  $: h = Math.max(...cells.map((d) => d.y)) + 1;\\n  $: keyboardVisible =\\n    typeof showKeyboard === \\\"boolean\\\" ? showKeyboard : isMobile;\\n\\n  $: cells, focusedCellIndex, focusedDirection, updateSecondarilyFocusedCells();\\n  $: sortedCellsInDirection = [...cells].sort((a, b) =>\\n    focusedDirection == \\\"down\\\" ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x\\n  );\\n\\n  onMount(() => {\\n    isMobile = checkMobile();\\n  });\\n\\n  function updateSecondarilyFocusedCells() {\\n    secondarilyFocusedCells = getSecondarilyFocusedCells({\\n      cells,\\n      focusedDirection,\\n      focusedCell,\\n    });\\n  }\\n\\n  function onCellUpdate(index, newValue, diff = 1) {\\n    const doReplaceFilledCells = !!cells[index].value;\\n    const newCells = [\\n      ...cells.slice(0, index),\\n      { ...cells[index], value: newValue },\\n      ...cells.slice(index + 1),\\n    ];\\n    cellsHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(\\n      0,\\n      numberOfStatesInHistory\\n    );\\n    cellsHistoryIndex = 0;\\n    cells = newCells;\\n\\n    onFocusCellDiff(diff, doReplaceFilledCells);\\n  }\\n\\n  function onHistoricalChange(diff) {\\n    cellsHistoryIndex += -diff;\\n    cells = cellsHistory[cellsHistoryIndex] || cells;\\n    focusedCellIndexHistoryIndex += -diff;\\n    focusedCellIndex =\\n      focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex;\\n  }\\n\\n  function onFocusCell(index) {\\n    if (index == focusedCellIndex) {\\n      onFlipDirection();\\n    } else {\\n      focusedCellIndex = index;\\n      focusedCellIndexHistory = [\\n        index,\\n        ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory),\\n      ];\\n      focusedCellIndexHistoryIndex = 0;\\n    }\\n  }\\n\\n  function onFocusCellDiff(diff, doReplaceFilledCells = true) {\\n    const sortedCellsInDirectionFiltered = sortedCellsInDirection.filter((d) =>\\n      doReplaceFilledCells ? true : !d.value\\n    );\\n    const currentCellIndex = sortedCellsInDirectionFiltered.findIndex(\\n      (d) => d.index == focusedCellIndex\\n    );\\n    const nextCellIndex = (\\n      sortedCellsInDirectionFiltered[currentCellIndex + diff] || {}\\n    ).index;\\n    const nextCell = cells[nextCellIndex];\\n    if (!nextCell) return;\\n    onFocusCell(nextCellIndex);\\n  }\\n\\n  function onFocusClueDiff(diff = 1) {\\n    const currentNumber = focusedCell.clueNumbers[focusedDirection];\\n    let nextCluesInDirection = clues.filter(\\n      (clue) =>\\n        (diff > 0\\n          ? clue.number > currentNumber\\n          : clue.number < currentNumber) && clue.direction == focusedDirection\\n    );\\n    if (diff < 0) {\\n      nextCluesInDirection = nextCluesInDirection.reverse();\\n    }\\n    let nextClue = nextCluesInDirection[Math.abs(diff) - 1];\\n    if (!nextClue) {\\n      onFlipDirection();\\n      nextClue = clues.filter((clue) => clue.direction == focusedDirection)[0];\\n    }\\n    focusedCellIndex = cells.findIndex(\\n      (cell) => cell.x == nextClue.x && cell.y == nextClue.y\\n    );\\n  }\\n\\n  function onMoveFocus(direction, diff) {\\n    if (focusedDirection != direction) {\\n      const dimension = direction == \\\"across\\\" ? \\\"x\\\" : \\\"y\\\";\\n      focusedDirection = direction;\\n    } else {\\n      const nextCell = getCellAfterDiff({\\n        diff,\\n        cells,\\n        direction,\\n        focusedCell,\\n      });\\n      if (!nextCell) return;\\n      onFocusCell(nextCell.index);\\n    }\\n  }\\n\\n  function onFlipDirection() {\\n    const newDirection = focusedDirection === \\\"across\\\" ? \\\"down\\\" : \\\"across\\\";\\n    const hasClueInNewDirection = !!focusedCell[\\\"clueNumbers\\\"][newDirection];\\n    if (hasClueInNewDirection) focusedDirection = newDirection;\\n  }\\n\\n  function onKeydown({ detail }) {\\n    const diff = detail === \\\"delete\\\" ? -1 : 1;\\n    const value = detail === \\\"delete\\\" ? \\\"\\\" : detail;\\n    onCellUpdate(focusedCellIndex, value, diff);\\n  }\\n</script>\\n\\n<section class=\\\"puzzle\\\" class:stacked>\\n  <svg viewBox=\\\"0 0 {w} {h}\\\">\\n    {#each cells as { x, y, value, index, number, custom }}\\n      <Cell\\n        x=\\\"{x}\\\"\\n        y=\\\"{y}\\\"\\n        index=\\\"{index}\\\"\\n        value=\\\"{value}\\\"\\n        number=\\\"{number}\\\"\\n        custom=\\\"{custom}\\\"\\n        changeDelay=\\\"{isRevealing ? (revealDuration / cells.length) * index : 0}\\\"\\n        isRevealing=\\\"{isRevealing}\\\"\\n        isFocused=\\\"{focusedCellIndex == index && !isDisableHighlight}\\\"\\n        isSecondarilyFocused=\\\"{secondarilyFocusedCells.includes(index) && !isDisableHighlight}\\\"\\n        onFocusCell=\\\"{onFocusCell}\\\"\\n        onCellUpdate=\\\"{onCellUpdate}\\\"\\n        onFocusClueDiff=\\\"{onFocusClueDiff}\\\"\\n        onMoveFocus=\\\"{onMoveFocus}\\\"\\n        onFlipDirection=\\\"{onFlipDirection}\\\"\\n        onHistoricalChange=\\\"{onHistoricalChange}\\\" />\\n    {/each}\\n  </svg>\\n</section>\\n\\n'{#if keyboardVisible}\\n  <div class=\\\"keyboard\\\">\\n    <Keyboard on:keydown=\\\"{onKeydown}\\\" />\\n  </div>\\n{/if}\\n\\n<style>\\n  section {\\n    position: -webkit-sticky;\\n    position: sticky;\\n    top: 1em;\\n    order: 0;\\n    flex: 1;\\n    height: -webkit-fit-content;\\n    height: -moz-fit-content;\\n    height: fit-content;\\n  }\\n\\n  section.stacked {\\n    position: relative;\\n    top: auto;\\n    height: auto;\\n    order: -1;\\n  }\\n\\n  svg {\\n    display: block;\\n    font-size: 1px;\\n    background: var(--cell-void-color);\\n    border: 4px solid var(--puzzle-border-color);\\n  }\\n\\n  .keyboard {\\n    order: 3;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAwLE,OAAO,eAAC,CAAC,AACP,QAAQ,CAAE,cAAc,CACxB,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,GAAG,CACR,KAAK,CAAE,CAAC,CACR,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,mBAAmB,CAC3B,MAAM,CAAE,gBAAgB,CACxB,MAAM,CAAE,WAAW,AACrB,CAAC,AAED,OAAO,QAAQ,eAAC,CAAC,AACf,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,CACT,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,EAAE,AACX,CAAC,AAED,GAAG,eAAC,CAAC,AACH,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,GAAG,CACd,UAAU,CAAE,IAAI,iBAAiB,CAAC,CAClC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,qBAAqB,CAAC,AAC9C,CAAC,AAED,SAAS,eAAC,CAAC,AACT,KAAK,CAAE,CAAC,AACV,CAAC\"}"
};

const numberOfStatesInHistory = 10;

const Puzzle = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { clues } = $$props;
	let { cells } = $$props;
	let { focusedDirection } = $$props;
	let { focusedCellIndex } = $$props;
	let { focusedCell } = $$props;
	let { isRevealing } = $$props;
	let { isDisableHighlight } = $$props;
	let { stacked } = $$props;
	let { revealDuration = 0 } = $$props;
	let { showKeyboard } = $$props;
	let cellsHistoryIndex = 0;
	let cellsHistory = [];
	let focusedCellIndexHistory = [];
	let secondarilyFocusedCells = [];
	let isMobile = false;

	onMount(() => {
		isMobile = checkMobile();
	});

	function updateSecondarilyFocusedCells() {
		secondarilyFocusedCells = getSecondarilyFocusedCells({ cells, focusedDirection, focusedCell });
	}

	function onCellUpdate(index, newValue, diff = 1) {
		const doReplaceFilledCells = !!cells[index].value;

		const newCells = [
			...cells.slice(0, index),
			{ ...cells[index], value: newValue },
			...cells.slice(index + 1)
		];

		cellsHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(0, numberOfStatesInHistory);
		cellsHistoryIndex = 0;
		cells = newCells;
		onFocusCellDiff(diff, doReplaceFilledCells);
	}

	function onHistoricalChange(diff) {
		cellsHistoryIndex += -diff;
		cells = cellsHistory[cellsHistoryIndex] || cells;
		focusedCellIndex = focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex;
	}

	function onFocusCell(index) {
		if (index == focusedCellIndex) {
			onFlipDirection();
		} else {
			focusedCellIndex = index;
			focusedCellIndexHistory = [index, ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory)];
		}
	}

	function onFocusCellDiff(diff, doReplaceFilledCells = true) {
		const sortedCellsInDirectionFiltered = sortedCellsInDirection.filter(d => doReplaceFilledCells ? true : !d.value);
		const currentCellIndex = sortedCellsInDirectionFiltered.findIndex(d => d.index == focusedCellIndex);
		const nextCellIndex = (sortedCellsInDirectionFiltered[currentCellIndex + diff] || {}).index;
		const nextCell = cells[nextCellIndex];
		if (!nextCell) return;
		onFocusCell(nextCellIndex);
	}

	function onFocusClueDiff(diff = 1) {
		const currentNumber = focusedCell.clueNumbers[focusedDirection];

		let nextCluesInDirection = clues.filter(clue => (diff > 0
		? clue.number > currentNumber
		: clue.number < currentNumber) && clue.direction == focusedDirection);

		if (diff < 0) {
			nextCluesInDirection = nextCluesInDirection.reverse();
		}

		let nextClue = nextCluesInDirection[Math.abs(diff) - 1];

		if (!nextClue) {
			onFlipDirection();
			nextClue = clues.filter(clue => clue.direction == focusedDirection)[0];
		}

		focusedCellIndex = cells.findIndex(cell => cell.x == nextClue.x && cell.y == nextClue.y);
	}

	function onMoveFocus(direction, diff) {
		if (focusedDirection != direction) {
			focusedDirection = direction;
		} else {
			const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
			if (!nextCell) return;
			onFocusCell(nextCell.index);
		}
	}

	function onFlipDirection() {
		const newDirection = focusedDirection === "across" ? "down" : "across";
		const hasClueInNewDirection = !!focusedCell["clueNumbers"][newDirection];
		if (hasClueInNewDirection) focusedDirection = newDirection;
	}

	if ($$props.clues === void 0 && $$bindings.clues && clues !== void 0) $$bindings.clues(clues);
	if ($$props.cells === void 0 && $$bindings.cells && cells !== void 0) $$bindings.cells(cells);
	if ($$props.focusedDirection === void 0 && $$bindings.focusedDirection && focusedDirection !== void 0) $$bindings.focusedDirection(focusedDirection);
	if ($$props.focusedCellIndex === void 0 && $$bindings.focusedCellIndex && focusedCellIndex !== void 0) $$bindings.focusedCellIndex(focusedCellIndex);
	if ($$props.focusedCell === void 0 && $$bindings.focusedCell && focusedCell !== void 0) $$bindings.focusedCell(focusedCell);
	if ($$props.isRevealing === void 0 && $$bindings.isRevealing && isRevealing !== void 0) $$bindings.isRevealing(isRevealing);
	if ($$props.isDisableHighlight === void 0 && $$bindings.isDisableHighlight && isDisableHighlight !== void 0) $$bindings.isDisableHighlight(isDisableHighlight);
	if ($$props.stacked === void 0 && $$bindings.stacked && stacked !== void 0) $$bindings.stacked(stacked);
	if ($$props.revealDuration === void 0 && $$bindings.revealDuration && revealDuration !== void 0) $$bindings.revealDuration(revealDuration);
	if ($$props.showKeyboard === void 0 && $$bindings.showKeyboard && showKeyboard !== void 0) $$bindings.showKeyboard(showKeyboard);
	$$result.css.add(css$4);
	let w;
	let h;
	let keyboardVisible;
	let sortedCellsInDirection;
	w = Math.max(...cells.map(d => d.x)) + 1;
	h = Math.max(...cells.map(d => d.y)) + 1;

	keyboardVisible = typeof showKeyboard === "boolean"
	? showKeyboard
	: isMobile;

	 {
		(updateSecondarilyFocusedCells());
	}

	sortedCellsInDirection = [...cells].sort((a, b) => focusedDirection == "down"
	? a.x - b.x || a.y - b.y
	: a.y - b.y || a.x - b.x);

	return `<section class="${["puzzle svelte-14mrlya", stacked ? "stacked" : ""].join(" ").trim()}"><svg viewBox="${"0 0 " + escape(w) + " " + escape(h)}" class="${"svelte-14mrlya"}">${each(cells, ({ x, y, value, index, number, custom }) => `${validate_component(Cell, "Cell").$$render(
		$$result,
		{
			x,
			y,
			index,
			value,
			number,
			custom,
			changeDelay: isRevealing ? revealDuration / cells.length * index : 0,
			isRevealing,
			isFocused: focusedCellIndex == index && !isDisableHighlight,
			isSecondarilyFocused: secondarilyFocusedCells.includes(index) && !isDisableHighlight,
			onFocusCell,
			onCellUpdate,
			onFocusClueDiff,
			onMoveFocus,
			onFlipDirection,
			onHistoricalChange
		},
		{},
		{}
	)}`)}</svg></section>

&#39;${keyboardVisible
	? `
  <div class="${"keyboard svelte-14mrlya"}">${validate_component(Keyboard, "Keyboard").$$render($$result, {}, {}, {})}</div>`
	: ``}`;
});

/* node_modules/svelte-crossword/src/Clue.svelte generated by Svelte v3.29.4 */

const css$5 = {
	code: "button.svelte-opd9z3{display:block;width:100%;background:none;text-align:left;-webkit-appearance:none;-moz-appearance:none;appearance:none;outline:none;border:none;border-left:6px solid transparent;padding:0.5em;cursor:pointer;line-height:1.325;color:var(--clue-text-color);font-family:var(--clue-text-font);font-size:1em;cursor:pointer}.clue.svelte-opd9z3:focus{border-color:var(--secondary-color)}.is-number-focused.svelte-opd9z3{border-left-color:var(--secondary-color)}.is-number-focused.is-direction-focused.svelte-opd9z3{background:var(--secondary-color)}.is-filled.svelte-opd9z3{opacity:0.33}",
	map: "{\"version\":3,\"file\":\"Clue.svelte\",\"sources\":[\"Clue.svelte\"],\"sourcesContent\":[\"<script>\\n  import scrollTo from \\\"./helpers/scrollTo.js\\\";\\n\\n  export let number;\\n  export let clue;\\n  export let custom;\\n  export let isFilled;\\n  export let isNumberFocused = false;\\n  export let isDirectionFocused = false;\\n  export let onFocus = () => {};\\n\\n  let element;\\n\\n  $: isFocused = isNumberFocused;\\n</script>\\n\\n<li bind:this=\\\"{element}\\\" use:scrollTo=\\\"{isFocused}\\\">\\n  <button\\n    class=\\\"clue {custom}\\\"\\n    class:is-number-focused=\\\"{isNumberFocused}\\\"\\n    class:is-direction-focused=\\\"{isDirectionFocused}\\\"\\n    class:is-filled=\\\"{isFilled}\\\"\\n    on:click=\\\"{onFocus}\\\">\\n    {number}.\\n    {clue}\\n  </button>\\n</li>\\n\\n<style>\\n  button {\\n    display: block;\\n    width: 100%;\\n    background: none;\\n    text-align: left;\\n    -webkit-appearance: none;\\n       -moz-appearance: none;\\n            appearance: none;\\n    outline: none;\\n    border: none;\\n    border-left: 6px solid transparent;\\n    padding: 0.5em;\\n    cursor: pointer;\\n    line-height: 1.325;\\n    color: var(--clue-text-color);\\n    font-family: var(--clue-text-font);\\n    font-size: 1em;\\n    cursor: pointer;\\n  }\\n  .clue:focus {\\n    border-color: var(--secondary-color);\\n  }\\n  .is-number-focused {\\n    border-left-color: var(--secondary-color);\\n  }\\n  .is-number-focused.is-direction-focused {\\n    background: var(--secondary-color);\\n  }\\n  .is-filled {\\n    opacity: 0.33;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AA6BE,MAAM,cAAC,CAAC,AACN,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CAChB,kBAAkB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CACxB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,CAClC,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,KAAK,CAClB,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,WAAW,CAAE,IAAI,gBAAgB,CAAC,CAClC,SAAS,CAAE,GAAG,CACd,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,mBAAK,MAAM,AAAC,CAAC,AACX,YAAY,CAAE,IAAI,iBAAiB,CAAC,AACtC,CAAC,AACD,kBAAkB,cAAC,CAAC,AAClB,iBAAiB,CAAE,IAAI,iBAAiB,CAAC,AAC3C,CAAC,AACD,kBAAkB,qBAAqB,cAAC,CAAC,AACvC,UAAU,CAAE,IAAI,iBAAiB,CAAC,AACpC,CAAC,AACD,UAAU,cAAC,CAAC,AACV,OAAO,CAAE,IAAI,AACf,CAAC\"}"
};

const Clue = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { number } = $$props;
	let { clue } = $$props;
	let { custom } = $$props;
	let { isFilled } = $$props;
	let { isNumberFocused = false } = $$props;
	let { isDirectionFocused = false } = $$props;

	let { onFocus = () => {
		
	} } = $$props;

	let element;
	if ($$props.number === void 0 && $$bindings.number && number !== void 0) $$bindings.number(number);
	if ($$props.clue === void 0 && $$bindings.clue && clue !== void 0) $$bindings.clue(clue);
	if ($$props.custom === void 0 && $$bindings.custom && custom !== void 0) $$bindings.custom(custom);
	if ($$props.isFilled === void 0 && $$bindings.isFilled && isFilled !== void 0) $$bindings.isFilled(isFilled);
	if ($$props.isNumberFocused === void 0 && $$bindings.isNumberFocused && isNumberFocused !== void 0) $$bindings.isNumberFocused(isNumberFocused);
	if ($$props.isDirectionFocused === void 0 && $$bindings.isDirectionFocused && isDirectionFocused !== void 0) $$bindings.isDirectionFocused(isDirectionFocused);
	if ($$props.onFocus === void 0 && $$bindings.onFocus && onFocus !== void 0) $$bindings.onFocus(onFocus);
	$$result.css.add(css$5);

	return `<li${add_attribute("this", element, 1)}><button class="${[
		"clue " + escape(custom) + " svelte-opd9z3",
		(isNumberFocused ? "is-number-focused" : "") + " " + (isDirectionFocused ? "is-direction-focused" : "") + " " + (isFilled ? "is-filled" : "")
	].join(" ").trim()}">${escape(number)}.
    ${escape(clue)}</button>
</li>`;
});

/* node_modules/svelte-crossword/src/ClueList.svelte generated by Svelte v3.29.4 */

const css$6 = {
	code: ".list.svelte-1bsyy3q{position:relative;max-height:45vh;margin-bottom:2em;overflow:auto}p.svelte-1bsyy3q{font-family:var(--clue-text-font);color:var(--clue-text-color);font-weight:700;text-transform:uppercase;padding-left:calc(0.5em + 6px);padding-bottom:0.5em;margin:0}ul.svelte-1bsyy3q{list-style-type:none;padding-left:0;margin:0;margin-top:1em}.svelte-1bsyy3q::-moz-scrollbar{width:9px}.svelte-1bsyy3q::-webkit-scrollbar{width:9px}.svelte-1bsyy3q::-moz-scrollbar-track{box-shadow:none;border-radius:10px;background:var(--clue-scrollbar-bg)}.svelte-1bsyy3q::-webkit-scrollbar-track{box-shadow:none;border-radius:10px;background:var(--clue-scrollbar-bg)}.svelte-1bsyy3q::scrollbar-thumb{border-radius:10px;background:var(--clue-scrollbar-fg);box-shadow:none}.svelte-1bsyy3q::-moz-scrollbar-thumb{background:var(--clue-scrollbar-fg);border-radius:6px}.svelte-1bsyy3q::-webkit-scrollbar-thumb{background:var(--clue-scrollbar-fg);border-radius:6px}",
	map: "{\"version\":3,\"file\":\"ClueList.svelte\",\"sources\":[\"ClueList.svelte\"],\"sourcesContent\":[\"<script>\\n  import Clue from \\\"./Clue.svelte\\\";\\n\\n  export let direction;\\n  export let clues;\\n  export let focusedClueNumbers;\\n  export let isDirectionFocused;\\n  export let onClueFocus;\\n</script>\\n\\n<p>{direction}</p>\\n<div class=\\\"list\\\">\\n  <ul>\\n    {#each clues as clue}\\n      <Clue\\n        clue=\\\"{clue.clue}\\\"\\n        number=\\\"{clue.number}\\\"\\n        custom=\\\"{clue.custom}\\\"\\n        isFilled=\\\"{clue.isFilled}\\\"\\n        isNumberFocused=\\\"{focusedClueNumbers[direction] === clue.number}\\\"\\n        isDirectionFocused=\\\"{isDirectionFocused}\\\"\\n        onFocus=\\\"{() => onClueFocus(clue)}\\\" />\\n    {/each}\\n  </ul>\\n</div>\\n\\n<style>\\n  .list {\\n    position: relative;\\n    max-height: 45vh;\\n    margin-bottom: 2em;\\n    overflow: auto;\\n  }\\n\\n  p {\\n    font-family: var(--clue-text-font);\\n    color: var(--clue-text-color);\\n    font-weight: 700;\\n    text-transform: uppercase;\\n    padding-left: calc(0.5em + 6px);\\n    padding-bottom: 0.5em;\\n    margin: 0;\\n  }\\n\\n  ul {\\n    list-style-type: none;\\n    padding-left: 0;\\n    margin: 0;\\n    margin-top: 1em;\\n  }\\n\\n  ::-moz-scrollbar {\\n    width: 9px;\\n  }\\n  ::-webkit-scrollbar {\\n    width: 9px;\\n  }\\n\\n  ::-moz-scrollbar-track {\\n    box-shadow: none;\\n    border-radius: 10px;\\n    background: var(--clue-scrollbar-bg);\\n  }\\n  ::-webkit-scrollbar-track {\\n    box-shadow: none;\\n    border-radius: 10px;\\n    background: var(--clue-scrollbar-bg);\\n  }\\n  ::scrollbar-thumb {\\n    border-radius: 10px;\\n    background: var(--clue-scrollbar-fg);\\n    box-shadow: none;\\n  }\\n  ::-moz-scrollbar-thumb {\\n    background: var(--clue-scrollbar-fg);\\n    border-radius: 6px;\\n  }\\n  ::-webkit-scrollbar-thumb {\\n    background: var(--clue-scrollbar-fg);\\n    border-radius: 6px;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AA2BE,KAAK,eAAC,CAAC,AACL,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,GAAG,CAClB,QAAQ,CAAE,IAAI,AAChB,CAAC,AAED,CAAC,eAAC,CAAC,AACD,WAAW,CAAE,IAAI,gBAAgB,CAAC,CAClC,KAAK,CAAE,IAAI,iBAAiB,CAAC,CAC7B,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,SAAS,CACzB,YAAY,CAAE,KAAK,KAAK,CAAC,CAAC,CAAC,GAAG,CAAC,CAC/B,cAAc,CAAE,KAAK,CACrB,MAAM,CAAE,CAAC,AACX,CAAC,AAED,EAAE,eAAC,CAAC,AACF,eAAe,CAAE,IAAI,CACrB,YAAY,CAAE,CAAC,CACf,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,GAAG,AACjB,CAAC,eAED,gBAAgB,AAAC,CAAC,AAChB,KAAK,CAAE,GAAG,AACZ,CAAC,eACD,mBAAmB,AAAC,CAAC,AACnB,KAAK,CAAE,GAAG,AACZ,CAAC,eAED,sBAAsB,AAAC,CAAC,AACtB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,IAAI,mBAAmB,CAAC,AACtC,CAAC,eACD,yBAAyB,AAAC,CAAC,AACzB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,IAAI,mBAAmB,CAAC,AACtC,CAAC,eACD,iBAAiB,AAAC,CAAC,AACjB,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,IAAI,mBAAmB,CAAC,CACpC,UAAU,CAAE,IAAI,AAClB,CAAC,eACD,sBAAsB,AAAC,CAAC,AACtB,UAAU,CAAE,IAAI,mBAAmB,CAAC,CACpC,aAAa,CAAE,GAAG,AACpB,CAAC,eACD,yBAAyB,AAAC,CAAC,AACzB,UAAU,CAAE,IAAI,mBAAmB,CAAC,CACpC,aAAa,CAAE,GAAG,AACpB,CAAC\"}"
};

const ClueList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { direction } = $$props;
	let { clues } = $$props;
	let { focusedClueNumbers } = $$props;
	let { isDirectionFocused } = $$props;
	let { onClueFocus } = $$props;
	if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
	if ($$props.clues === void 0 && $$bindings.clues && clues !== void 0) $$bindings.clues(clues);
	if ($$props.focusedClueNumbers === void 0 && $$bindings.focusedClueNumbers && focusedClueNumbers !== void 0) $$bindings.focusedClueNumbers(focusedClueNumbers);
	if ($$props.isDirectionFocused === void 0 && $$bindings.isDirectionFocused && isDirectionFocused !== void 0) $$bindings.isDirectionFocused(isDirectionFocused);
	if ($$props.onClueFocus === void 0 && $$bindings.onClueFocus && onClueFocus !== void 0) $$bindings.onClueFocus(onClueFocus);
	$$result.css.add(css$6);

	return `<p class="${"svelte-1bsyy3q"}">${escape(direction)}</p>
<div class="${"list svelte-1bsyy3q"}"><ul class="${"svelte-1bsyy3q"}">${each(clues, clue => `${validate_component(Clue, "Clue").$$render(
		$$result,
		{
			clue: clue.clue,
			number: clue.number,
			custom: clue.custom,
			isFilled: clue.isFilled,
			isNumberFocused: focusedClueNumbers[direction] === clue.number,
			isDirectionFocused,
			onFocus: () => onClueFocus(clue)
		},
		{},
		{}
	)}`)}</ul>
</div>`;
});

/* node_modules/svelte-crossword/src/ClueBar.svelte generated by Svelte v3.29.4 */

const css$7 = {
	code: ".bar.svelte-wiuayb{width:100%;display:flex;justify-content:space-between;background-color:#efefef;align-items:center}p.svelte-wiuayb{padding:0 1em;line-height:1.325}button.svelte-wiuayb{cursor:pointer;font-size:1em;border:none;line-height:1}",
	map: "{\"version\":3,\"file\":\"ClueBar.svelte\",\"sources\":[\"ClueBar.svelte\"],\"sourcesContent\":[\"<script>\\n  import { createEventDispatcher } from \\\"svelte\\\";\\n  const dispatch = createEventDispatcher();\\n\\n  export let currentClue;\\n  $: clue = currentClue[\\\"clue\\\"];\\n  $: custom = currentClue[\\\"custom\\\"];\\n</script>\\n\\n<div class=\\\"bar {custom}\\\">\\n  <button on:click=\\\"{() => dispatch('nextClue', currentClue.index - 1)}\\\">\\n    <svg\\n      width=\\\"24\\\"\\n      height=\\\"24\\\"\\n      viewBox=\\\"0 0 24 24\\\"\\n      fill=\\\"none\\\"\\n      stroke=\\\"currentColor\\\"\\n      stroke-width=\\\"2\\\"\\n      stroke-linecap=\\\"round\\\"\\n      stroke-linejoin=\\\"round\\\"\\n      class=\\\"feather feather-chevron-left\\\"><polyline\\n        points=\\\"15 18 9 12 15 6\\\"></polyline></svg>\\n  </button>\\n  <p>{clue}</p>\\n  <button on:click=\\\"{() => dispatch('nextClue', currentClue.index + 1)}\\\">\\n    <svg\\n      width=\\\"24\\\"\\n      height=\\\"24\\\"\\n      viewBox=\\\"0 0 24 24\\\"\\n      fill=\\\"none\\\"\\n      stroke=\\\"currentColor\\\"\\n      stroke-width=\\\"2\\\"\\n      stroke-linecap=\\\"round\\\"\\n      stroke-linejoin=\\\"round\\\"\\n      class=\\\"feather feather-chevron-right\\\"><polyline\\n        points=\\\"9 18 15 12 9 6\\\"></polyline></svg>\\n  </button>\\n</div>\\n\\n<style>\\n  .bar {\\n    width: 100%;\\n    display: flex;\\n    justify-content: space-between;\\n    background-color: #efefef;\\n    align-items: center;\\n  }\\n\\n  p {\\n    padding: 0 1em;\\n    line-height: 1.325;\\n  }\\n\\n  button {\\n    cursor: pointer;\\n    font-size: 1em;\\n    border: none;\\n    line-height: 1;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAwCE,IAAI,cAAC,CAAC,AACJ,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,gBAAgB,CAAE,OAAO,CACzB,WAAW,CAAE,MAAM,AACrB,CAAC,AAED,CAAC,cAAC,CAAC,AACD,OAAO,CAAE,CAAC,CAAC,GAAG,CACd,WAAW,CAAE,KAAK,AACpB,CAAC,AAED,MAAM,cAAC,CAAC,AACN,MAAM,CAAE,OAAO,CACf,SAAS,CAAE,GAAG,CACd,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,CAAC,AAChB,CAAC\"}"
};

const ClueBar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const dispatch = createEventDispatcher();
	let { currentClue } = $$props;
	if ($$props.currentClue === void 0 && $$bindings.currentClue && currentClue !== void 0) $$bindings.currentClue(currentClue);
	$$result.css.add(css$7);
	let clue;
	let custom;
	clue = currentClue["clue"];
	custom = currentClue["custom"];

	return `<div class="${"bar " + escape(custom) + " svelte-wiuayb"}"><button class="${"svelte-wiuayb"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"none"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-chevron-left"}"><polyline points="${"15 18 9 12 15 6"}"></polyline></svg></button>
  <p class="${"svelte-wiuayb"}">${escape(clue)}</p>
  <button class="${"svelte-wiuayb"}"><svg width="${"24"}" height="${"24"}" viewBox="${"0 0 24 24"}" fill="${"none"}" stroke="${"currentColor"}" stroke-width="${"2"}" stroke-linecap="${"round"}" stroke-linejoin="${"round"}" class="${"feather feather-chevron-right"}"><polyline points="${"9 18 15 12 9 6"}"></polyline></svg></button>
</div>`;
});

/* node_modules/svelte-crossword/src/Clues.svelte generated by Svelte v3.29.4 */

const css$8 = {
	code: "section.svelte-1fvqg1s{position:-webkit-sticky;position:sticky;top:1em;flex:0 1 var(--clue-width);height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;margin:0;margin-right:1em}section.stacked.svelte-1fvqg1s{position:static;height:auto;top:auto;display:block;margin:1em 0;flex:auto}.clues--stacked.svelte-1fvqg1s{margin:0}",
	map: "{\"version\":3,\"file\":\"Clues.svelte\",\"sources\":[\"Clues.svelte\"],\"sourcesContent\":[\"<script>\\n  import ClueList from \\\"./ClueList.svelte\\\";\\n  import ClueBar from \\\"./ClueBar.svelte\\\";\\n\\n  export let clues;\\n  export let cellIndexMap;\\n  export let focusedDirection;\\n  export let focusedCellIndex;\\n  export let focusedCell;\\n  export let stacked;\\n\\n  $: focusedClueNumbers = focusedCell.clueNumbers || {};\\n  $: currentClue = clues.find(\\n    (c) =>\\n      c.direction === focusedDirection &&\\n      c.number === focusedClueNumbers[focusedDirection]\\n  );\\n\\n  function onClueFocus({ direction, id }) {\\n    focusedDirection = direction;\\n    focusedCellIndex = cellIndexMap[id] || 0;\\n  }\\n\\n  function onNextClue({ detail }) {\\n    let next = detail;\\n    if (next < 0) next = clues.length - 1;\\n    else if (next > clues.length - 1) next = 0;\\n    const { direction, id } = clues[next];\\n    onClueFocus({ direction, id });\\n  }\\n</script>\\n\\n<section class=\\\"clues\\\" class:stacked>\\n  {#if stacked}\\n    <div class=\\\"clues--stacked\\\">\\n      <ClueBar currentClue=\\\"{currentClue}\\\" on:nextClue=\\\"{onNextClue}\\\" />\\n    </div>\\n  {:else}\\n    <div class=\\\"clues--list\\\">\\n      {#each ['across', 'down'] as direction}\\n        <ClueList\\n          direction=\\\"{direction}\\\"\\n          focusedClueNumbers=\\\"{focusedClueNumbers}\\\"\\n          clues=\\\"{clues.filter((d) => d.direction === direction)}\\\"\\n          isDirectionFocused=\\\"{focusedDirection === direction}\\\"\\n          onClueFocus=\\\"{onClueFocus}\\\" />\\n      {/each}\\n    </div>\\n  {/if}\\n</section>\\n\\n<style>\\n  section {\\n    position: -webkit-sticky;\\n    position: sticky;\\n    top: 1em;\\n    flex: 0 1 var(--clue-width);\\n    height: -webkit-fit-content;\\n    height: -moz-fit-content;\\n    height: fit-content;\\n    margin: 0;\\n    margin-right: 1em;\\n  }\\n\\n  section.stacked {\\n    position: static;\\n    height: auto;\\n    top: auto;\\n    display: block;\\n    margin: 1em 0;\\n    flex: auto;\\n  }\\n\\n  .clues--stacked {\\n    margin: 0;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAoDE,OAAO,eAAC,CAAC,AACP,QAAQ,CAAE,cAAc,CACxB,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,CAAC,CAAC,CAAC,CAAC,IAAI,YAAY,CAAC,CAC3B,MAAM,CAAE,mBAAmB,CAC3B,MAAM,CAAE,gBAAgB,CACxB,MAAM,CAAE,WAAW,CACnB,MAAM,CAAE,CAAC,CACT,YAAY,CAAE,GAAG,AACnB,CAAC,AAED,OAAO,QAAQ,eAAC,CAAC,AACf,QAAQ,CAAE,MAAM,CAChB,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,IAAI,CACT,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,IAAI,CAAE,IAAI,AACZ,CAAC,AAED,eAAe,eAAC,CAAC,AACf,MAAM,CAAE,CAAC,AACX,CAAC\"}"
};

const Clues = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { clues } = $$props;
	let { cellIndexMap } = $$props;
	let { focusedDirection } = $$props;
	let { focusedCellIndex } = $$props;
	let { focusedCell } = $$props;
	let { stacked } = $$props;

	function onClueFocus({ direction, id }) {
		focusedDirection = direction;
		focusedCellIndex = cellIndexMap[id] || 0;
	}

	if ($$props.clues === void 0 && $$bindings.clues && clues !== void 0) $$bindings.clues(clues);
	if ($$props.cellIndexMap === void 0 && $$bindings.cellIndexMap && cellIndexMap !== void 0) $$bindings.cellIndexMap(cellIndexMap);
	if ($$props.focusedDirection === void 0 && $$bindings.focusedDirection && focusedDirection !== void 0) $$bindings.focusedDirection(focusedDirection);
	if ($$props.focusedCellIndex === void 0 && $$bindings.focusedCellIndex && focusedCellIndex !== void 0) $$bindings.focusedCellIndex(focusedCellIndex);
	if ($$props.focusedCell === void 0 && $$bindings.focusedCell && focusedCell !== void 0) $$bindings.focusedCell(focusedCell);
	if ($$props.stacked === void 0 && $$bindings.stacked && stacked !== void 0) $$bindings.stacked(stacked);
	$$result.css.add(css$8);
	let focusedClueNumbers;
	let currentClue;
	focusedClueNumbers = focusedCell.clueNumbers || {};
	currentClue = clues.find(c => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]);

	return `<section class="${["clues svelte-1fvqg1s", stacked ? "stacked" : ""].join(" ").trim()}">${stacked
	? `<div class="${"clues--stacked svelte-1fvqg1s"}">${validate_component(ClueBar, "ClueBar").$$render($$result, { currentClue }, {}, {})}</div>`
	: `<div class="${"clues--list"}">${each(["across", "down"], direction => `${validate_component(ClueList, "ClueList").$$render(
			$$result,
			{
				direction,
				focusedClueNumbers,
				clues: clues.filter(d => d.direction === direction),
				isDirectionFocused: focusedDirection === direction,
				onClueFocus
			},
			{},
			{}
		)}`)}</div>`}
</section>`;
});

function quadIn(t) {
    return t * t;
}

/* node_modules/svelte-crossword/src/Confetti.svelte generated by Svelte v3.29.4 */

const css$9 = {
	code: ".confetti.svelte-1gawpbx{width:2em;position:absolute;stroke-linecap:round;stroke-linejoin:round;fill-rule:evenodd;clip-rule:evenodd;pointer-events:none;overflow:visible;transform:translate(-50%, -50%)}@-webkit-keyframes svelte-1gawpbx-pop{0%{transform:rotate(var(--rotation)) scale(1) translate(0em, 0em)}100%{transform:rotate(calc(var(--rotation) + 60deg)) scale(0)\n        translate(9em, 9em);fill:white}}@keyframes svelte-1gawpbx-pop{0%{transform:rotate(var(--rotation)) scale(1) translate(0em, 0em)}100%{transform:rotate(calc(var(--rotation) + 60deg)) scale(0)\n        translate(9em, 9em);fill:white}}g.svelte-1gawpbx{transition:all 0.5s ease-out;transform:rotate(var(--rotation)) scale(0) translate(0, 0);-webkit-animation:svelte-1gawpbx-pop 2s ease-out;animation:svelte-1gawpbx-pop 2s ease-out;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite}",
	map: "{\"version\":3,\"file\":\"Confetti.svelte\",\"sources\":[\"Confetti.svelte\"],\"sourcesContent\":[\"<script>\\n  import { quadIn } from \\\"svelte/easing\\\";\\n\\n  export let numberOfElements = 50;\\n  export let durationInSeconds = 2;\\n  export let colors = [\\n    \\\"#fff\\\",\\n    \\\"#c7ecee\\\",\\n    \\\"#778beb\\\",\\n    \\\"#f7d794\\\",\\n    \\\"#63cdda\\\",\\n    \\\"#cf6a87\\\",\\n    \\\"#e77f67\\\",\\n    \\\"#786fa6\\\",\\n    \\\"#FDA7DF\\\",\\n    \\\"#4b7bec\\\",\\n    \\\"#475c83\\\",\\n  ];\\n\\n  const pickFrom = (arr) => arr[Math.round(Math.random() * arr.length)];\\n  const randomNumber = (min, max) => Math.random() * (max - min) + min;\\n  const getManyOf = (str) => new Array(30).fill(0).map(() => str);\\n\\n  const elementOptions = [\\n    ...getManyOf(`<circle r=\\\"3\\\" />`),\\n    ...getManyOf(\\n      `<path d=\\\"M3.83733 4.73234C4.38961 4.73234 4.83733 4.28463 4.83733 3.73234C4.83733 3.18006 4.38961 2.73234 3.83733 2.73234C3.28505 2.73234 2.83733 3.18006 2.83733 3.73234C2.83733 4.28463 3.28505 4.73234 3.83733 4.73234ZM3.83733 6.73234C5.49418 6.73234 6.83733 5.38919 6.83733 3.73234C6.83733 2.07549 5.49418 0.732341 3.83733 0.732341C2.18048 0.732341 0.83733 2.07549 0.83733 3.73234C0.83733 5.38919 2.18048 6.73234 3.83733 6.73234Z\\\" />`\\n    ),\\n    ...getManyOf(\\n      `<path d=\\\"M4.29742 2.26041C3.86864 2.1688 3.20695 2.21855 2.13614 3.0038C1.69078 3.33041 1.06498 3.23413 0.738375 2.78876C0.411774 2.3434 0.508051 1.7176 0.953417 1.39099C2.32237 0.387097 3.55827 0.0573281 4.71534 0.304565C5.80081 0.536504 6.61625 1.24716 7.20541 1.78276C7.28295 1.85326 7.35618 1.92051 7.4263 1.9849C7.64841 2.18888 7.83929 2.36418 8.03729 2.52315C8.29108 2.72692 8.48631 2.8439 8.64952 2.90181C8.7915 2.95219 8.91895 2.96216 9.07414 2.92095C9.24752 2.8749 9.5134 2.7484 9.88467 2.42214C10.2995 2.05757 10.9314 2.09833 11.2959 2.51319C11.6605 2.92805 11.6198 3.5599 11.2049 3.92447C10.6816 4.38435 10.1478 4.70514 9.58752 4.85394C9.00909 5.00756 8.469 4.95993 7.9807 4.78667C7.51364 4.62093 7.11587 4.34823 6.78514 4.08268C6.53001 3.87783 6.27248 3.64113 6.04114 3.4285C5.97868 3.37109 5.91814 3.31544 5.86006 3.26264C5.25645 2.7139 4.79779 2.36733 4.29742 2.26041Z\\\" />`\\n    ),\\n    ...getManyOf(`<rect width=\\\"4\\\" height=\\\"4\\\" x=\\\"-2\\\" y=\\\"-2\\\" />`),\\n    `<path d=\\\"M -5 5 L 0 -5 L 5 5 Z\\\" />`,\\n    ...\\\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\\\"\\n      .split(\\\"\\\")\\n      .map((letter) => `<text style=\\\"font-weight: 700\\\">${letter}</text>`),\\n  ];\\n\\n  const allElements = new Array(numberOfElements)\\n    .fill(0)\\n    .map((_, i) => [pickFrom(elementOptions), pickFrom(colors), Math.random()]);\\n</script>\\n\\n<svg class=\\\"confetti\\\" viewBox=\\\"-10 -10 10 10\\\">\\n  {#each allElements as [element, color, scale], i}\\n    <g style=\\\"transform: scale({scale})\\\">\\n      <g\\n        fill=\\\"{color}\\\"\\n        style=\\\"{[`--rotation: ${Math.random() * 360}deg`, `animation-delay: ${quadIn(i / numberOfElements)}s`, `animation-duration: ${durationInSeconds * randomNumber(0.7, 1)}s`].join(';')}\\\">\\n        {@html element}\\n      </g>\\n    </g>\\n  {/each}\\n</svg>\\n\\n<style>\\n  .confetti {\\n    width: 2em;\\n    position: absolute;\\n    stroke-linecap: round;\\n    stroke-linejoin: round;\\n    fill-rule: evenodd;\\n    clip-rule: evenodd;\\n    pointer-events: none;\\n    overflow: visible;\\n    transform: translate(-50%, -50%);\\n  }\\n  @-webkit-keyframes pop {\\n    0% {\\n      transform: rotate(var(--rotation)) scale(1) translate(0em, 0em);\\n    }\\n    100% {\\n      transform: rotate(calc(var(--rotation) + 60deg)) scale(0)\\n        translate(9em, 9em);\\n      fill: white;\\n    }\\n  }\\n  @keyframes pop {\\n    0% {\\n      transform: rotate(var(--rotation)) scale(1) translate(0em, 0em);\\n    }\\n    100% {\\n      transform: rotate(calc(var(--rotation) + 60deg)) scale(0)\\n        translate(9em, 9em);\\n      fill: white;\\n    }\\n  }\\n  g {\\n    transition: all 0.5s ease-out;\\n    transform: rotate(var(--rotation)) scale(0) translate(0, 0);\\n    -webkit-animation: pop 2s ease-out;\\n            animation: pop 2s ease-out;\\n    -webkit-animation-iteration-count: infinite;\\n            animation-iteration-count: infinite;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAwDE,SAAS,eAAC,CAAC,AACT,KAAK,CAAE,GAAG,CACV,QAAQ,CAAE,QAAQ,CAClB,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,SAAS,CAAE,OAAO,CAClB,SAAS,CAAE,OAAO,CAClB,cAAc,CAAE,IAAI,CACpB,QAAQ,CAAE,OAAO,CACjB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC,AACD,mBAAmB,kBAAI,CAAC,AACtB,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,IAAI,UAAU,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CAAC,UAAU,GAAG,CAAC,CAAC,GAAG,CAAC,AACjE,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,KAAK,IAAI,UAAU,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC;QACvD,UAAU,GAAG,CAAC,CAAC,GAAG,CAAC,CACrB,IAAI,CAAE,KAAK,AACb,CAAC,AACH,CAAC,AACD,WAAW,kBAAI,CAAC,AACd,EAAE,AAAC,CAAC,AACF,SAAS,CAAE,OAAO,IAAI,UAAU,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CAAC,UAAU,GAAG,CAAC,CAAC,GAAG,CAAC,AACjE,CAAC,AACD,IAAI,AAAC,CAAC,AACJ,SAAS,CAAE,OAAO,KAAK,IAAI,UAAU,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC;QACvD,UAAU,GAAG,CAAC,CAAC,GAAG,CAAC,CACrB,IAAI,CAAE,KAAK,AACb,CAAC,AACH,CAAC,AACD,CAAC,eAAC,CAAC,AACD,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,QAAQ,CAC7B,SAAS,CAAE,OAAO,IAAI,UAAU,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CAAC,UAAU,CAAC,CAAC,CAAC,CAAC,CAAC,CAC3D,iBAAiB,CAAE,kBAAG,CAAC,EAAE,CAAC,QAAQ,CAC1B,SAAS,CAAE,kBAAG,CAAC,EAAE,CAAC,QAAQ,CAClC,iCAAiC,CAAE,QAAQ,CACnC,yBAAyB,CAAE,QAAQ,AAC7C,CAAC\"}"
};

const Confetti = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { numberOfElements = 50 } = $$props;
	let { durationInSeconds = 2 } = $$props;

	let { colors = [
		"#fff",
		"#c7ecee",
		"#778beb",
		"#f7d794",
		"#63cdda",
		"#cf6a87",
		"#e77f67",
		"#786fa6",
		"#FDA7DF",
		"#4b7bec",
		"#475c83"
	] } = $$props;

	const pickFrom = arr => arr[Math.round(Math.random() * arr.length)];
	const randomNumber = (min, max) => Math.random() * (max - min) + min;
	const getManyOf = str => new Array(30).fill(0).map(() => str);

	const elementOptions = [
		...getManyOf(`<circle r="3" />`),
		...getManyOf(`<path d="M3.83733 4.73234C4.38961 4.73234 4.83733 4.28463 4.83733 3.73234C4.83733 3.18006 4.38961 2.73234 3.83733 2.73234C3.28505 2.73234 2.83733 3.18006 2.83733 3.73234C2.83733 4.28463 3.28505 4.73234 3.83733 4.73234ZM3.83733 6.73234C5.49418 6.73234 6.83733 5.38919 6.83733 3.73234C6.83733 2.07549 5.49418 0.732341 3.83733 0.732341C2.18048 0.732341 0.83733 2.07549 0.83733 3.73234C0.83733 5.38919 2.18048 6.73234 3.83733 6.73234Z" />`),
		...getManyOf(`<path d="M4.29742 2.26041C3.86864 2.1688 3.20695 2.21855 2.13614 3.0038C1.69078 3.33041 1.06498 3.23413 0.738375 2.78876C0.411774 2.3434 0.508051 1.7176 0.953417 1.39099C2.32237 0.387097 3.55827 0.0573281 4.71534 0.304565C5.80081 0.536504 6.61625 1.24716 7.20541 1.78276C7.28295 1.85326 7.35618 1.92051 7.4263 1.9849C7.64841 2.18888 7.83929 2.36418 8.03729 2.52315C8.29108 2.72692 8.48631 2.8439 8.64952 2.90181C8.7915 2.95219 8.91895 2.96216 9.07414 2.92095C9.24752 2.8749 9.5134 2.7484 9.88467 2.42214C10.2995 2.05757 10.9314 2.09833 11.2959 2.51319C11.6605 2.92805 11.6198 3.5599 11.2049 3.92447C10.6816 4.38435 10.1478 4.70514 9.58752 4.85394C9.00909 5.00756 8.469 4.95993 7.9807 4.78667C7.51364 4.62093 7.11587 4.34823 6.78514 4.08268C6.53001 3.87783 6.27248 3.64113 6.04114 3.4285C5.97868 3.37109 5.91814 3.31544 5.86006 3.26264C5.25645 2.7139 4.79779 2.36733 4.29742 2.26041Z" />`),
		...getManyOf(`<rect width="4" height="4" x="-2" y="-2" />`),
		`<path d="M -5 5 L 0 -5 L 5 5 Z" />`,
		...("ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("").map(letter => `<text style="font-weight: 700">${letter}</text>`)
	];

	const allElements = new Array(numberOfElements).fill(0).map((_, i) => [pickFrom(elementOptions), pickFrom(colors), Math.random()]);
	if ($$props.numberOfElements === void 0 && $$bindings.numberOfElements && numberOfElements !== void 0) $$bindings.numberOfElements(numberOfElements);
	if ($$props.durationInSeconds === void 0 && $$bindings.durationInSeconds && durationInSeconds !== void 0) $$bindings.durationInSeconds(durationInSeconds);
	if ($$props.colors === void 0 && $$bindings.colors && colors !== void 0) $$bindings.colors(colors);
	$$result.css.add(css$9);

	return `<svg class="${"confetti svelte-1gawpbx"}" viewBox="${"-10 -10 10 10"}">${each(allElements, ([element, color, scale], i) => `<g style="${"transform: scale(" + escape(scale) + ")"}" class="${"svelte-1gawpbx"}"><g${add_attribute("fill", color, 0)}${add_attribute(
		"style",
		[
			`--rotation: ${Math.random() * 360}deg`,
			`animation-delay: ${quadIn(i / numberOfElements)}s`,
			`animation-duration: ${durationInSeconds * randomNumber(0.7, 1)}s`
		].join(";"),
		0
	)} class="${"svelte-1gawpbx"}">${element}</g></g>`)}</svg>`;
});

/* node_modules/svelte-crossword/src/CompletedMessage.svelte generated by Svelte v3.29.4 */

const css$a = {
	code: ".completed.svelte-wk0ya0{position:absolute;top:min(50%, 15em);left:50%;background:white;transform:translate(-50%, -50%);border-radius:4px;z-index:100;box-shadow:0 4px 8px 4px rgba(0, 0, 0, 0.2)}.curtain.svelte-wk0ya0{position:absolute;top:0;right:0;bottom:0;left:0;background:#fff;opacity:0.9;cursor:pointer;z-index:1}h3.svelte-wk0ya0{margin:0;margin-bottom:0.5em}button.svelte-wk0ya0{cursor:pointer;margin-left:1em;font-size:1em;background-color:var(--toolbar-button-bg, #efefef);border-radius:var(--toolbar-button-border-radius, 4px);color:var(--toolbar-button-color, #6a6a6a);padding:var(--toolbar-button-padding, 0.75em);border:var(--toolbar-button-border, none);font-weight:var(--toolbar-button-font-weight, 400);transition:background-color 150ms}button.svelte-wk0ya0:hover{background-color:var(--toolbar-button-bg-hover, #cdcdcd)}.content.svelte-wk0ya0{position:relative;display:flex;flex-direction:column;align-items:center;padding:2em}.message.svelte-wk0ya0{margin-bottom:1em}.confetti.svelte-wk0ya0{position:absolute;top:30%;left:50%;transform:translate(-50%, -50%)}",
	map: "{\"version\":3,\"file\":\"CompletedMessage.svelte\",\"sources\":[\"CompletedMessage.svelte\"],\"sourcesContent\":[\"<script>\\n  import { fade } from \\\"svelte/transition\\\";\\n  import Confetti from \\\"./Confetti.svelte\\\";\\n\\n  export let showConfetti = true;\\n\\n  let isOpen = true;\\n</script>\\n\\n{#if isOpen}\\n  <div class=\\\"completed\\\" transition:fade=\\\"{{ y: 20 }}\\\">\\n    <div class=\\\"content\\\">\\n      <div class=\\\"message\\\">\\n        <slot name=\\\"message\\\">\\n          <h3>You solved it!</h3>\\n        </slot>\\n      </div>\\n\\n      <button on:click=\\\"{() => (isOpen = false)}\\\">View puzzle</button>\\n    </div>\\n\\n    {#if showConfetti}\\n      <div class=\\\"confetti\\\">\\n        <Confetti />\\n      </div>\\n    {/if}\\n  </div>\\n  <div\\n    class=\\\"curtain\\\"\\n    transition:fade=\\\"{{ duration: 250 }}\\\"\\n    on:click=\\\"{() => (isOpen = false)}\\\"></div>\\n{/if}\\n\\n<style>\\n  .completed {\\n    position: absolute;\\n    top: min(50%, 15em);\\n    left: 50%;\\n    background: white;\\n    transform: translate(-50%, -50%);\\n    border-radius: 4px;\\n    z-index: 100;\\n    box-shadow: 0 4px 8px 4px rgba(0, 0, 0, 0.2);\\n  }\\n\\n  .curtain {\\n    position: absolute;\\n    top: 0;\\n    right: 0;\\n    bottom: 0;\\n    left: 0;\\n    background: #fff;\\n    opacity: 0.9;\\n    cursor: pointer;\\n    z-index: 1;\\n  }\\n\\n  h3 {\\n    margin: 0;\\n    margin-bottom: 0.5em;\\n  }\\n\\n  button {\\n    cursor: pointer;\\n    margin-left: 1em;\\n    font-size: 1em;\\n    background-color: var(--toolbar-button-bg, #efefef);\\n    border-radius: var(--toolbar-button-border-radius, 4px);\\n    color: var(--toolbar-button-color, #6a6a6a);\\n    padding: var(--toolbar-button-padding, 0.75em);\\n    border: var(--toolbar-button-border, none);\\n    font-weight: var(--toolbar-button-font-weight, 400);\\n    transition: background-color 150ms;\\n  }\\n\\n  button:hover {\\n    background-color: var(--toolbar-button-bg-hover, #cdcdcd);\\n  }\\n\\n  .content {\\n    position: relative;\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    padding: 2em;\\n  }\\n\\n  .message {\\n    margin-bottom: 1em;\\n  }\\n\\n  .confetti {\\n    position: absolute;\\n    top: 30%;\\n    left: 50%;\\n    transform: translate(-50%, -50%);\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAkCE,UAAU,cAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,IAAI,GAAG,CAAC,CAAC,IAAI,CAAC,CACnB,IAAI,CAAE,GAAG,CACT,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,AAC9C,CAAC,AAED,QAAQ,cAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,OAAO,CACf,OAAO,CAAE,CAAC,AACZ,CAAC,AAED,EAAE,cAAC,CAAC,AACF,MAAM,CAAE,CAAC,CACT,aAAa,CAAE,KAAK,AACtB,CAAC,AAED,MAAM,cAAC,CAAC,AACN,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,GAAG,CACd,gBAAgB,CAAE,IAAI,mBAAmB,CAAC,QAAQ,CAAC,CACnD,aAAa,CAAE,IAAI,8BAA8B,CAAC,IAAI,CAAC,CACvD,KAAK,CAAE,IAAI,sBAAsB,CAAC,QAAQ,CAAC,CAC3C,OAAO,CAAE,IAAI,wBAAwB,CAAC,OAAO,CAAC,CAC9C,MAAM,CAAE,IAAI,uBAAuB,CAAC,KAAK,CAAC,CAC1C,WAAW,CAAE,IAAI,4BAA4B,CAAC,IAAI,CAAC,CACnD,UAAU,CAAE,gBAAgB,CAAC,KAAK,AACpC,CAAC,AAED,oBAAM,MAAM,AAAC,CAAC,AACZ,gBAAgB,CAAE,IAAI,yBAAyB,CAAC,QAAQ,CAAC,AAC3D,CAAC,AAED,QAAQ,cAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,GAAG,AACd,CAAC,AAED,QAAQ,cAAC,CAAC,AACR,aAAa,CAAE,GAAG,AACpB,CAAC,AAED,SAAS,cAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC\"}"
};

const CompletedMessage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { showConfetti = true } = $$props;
	if ($$props.showConfetti === void 0 && $$bindings.showConfetti && showConfetti !== void 0) $$bindings.showConfetti(showConfetti);
	$$result.css.add(css$a);

	return `${ `<div class="${"completed svelte-wk0ya0"}"><div class="${"content svelte-wk0ya0"}"><div class="${"message svelte-wk0ya0"}">${slots.message
		? slots.message({})
		: `
          <h3 class="${"svelte-wk0ya0"}">You solved it!</h3>
        `}</div>

      <button class="${"svelte-wk0ya0"}">View puzzle</button></div>

    ${showConfetti
		? `<div class="${"confetti svelte-wk0ya0"}">${validate_component(Confetti, "Confetti").$$render($$result, {}, {}, {})}</div>`
		: ``}</div>
  <div class="${"curtain svelte-wk0ya0"}"></div>`
	}`;
});

function createClues(data) {
	// determine if 0 or 1 based
	const minX = Math.min(...data.map(d => d.x));
	const minY = Math.min(...data.map(d => d.y));
	const adjust = Math.min(minX, minY);

	
	const withAdjust = data.map(d => ({
		...d,
		x: d.x - adjust,
		y: d.y - adjust
	}));

  const withId = withAdjust.map((d, i) => ({
		...d,
    id: `${d.x}-${d.y}`,
  }));
	
  // sort asc by start position of clue so we have proper clue ordering
  withId.sort((a, b) => a.y - b.y || a.x - b.x);

  // create a lookup to store clue number (and reuse if same start pos)
  let lookup = {};
  let currentNumber = 1;

  const withNumber = withId.map((d) => {
    let number;
    if (lookup[d.id]) number = lookup[d.id];
    else {
      lookup[d.id] = number = currentNumber;
      currentNumber += 1;
    }
    return {
      ...d,
      number,
    };
  });


	// create cells for each letter
	const withCells = withNumber.map(d => {
		const chars = d.answer.split("");
    const cells = chars.map((answer, i) => {
      const x = d.x + (d.direction === "across" ? i : 0);
      const y = d.y + (d.direction === "down" ? i : 0);
      const number = i === 0 ? d.number : "";
      const clueNumbers = { [d.direction]: d.number };
      const id = `${x}-${y}`;
      const value = "";
      const custom = d.custom || "";
      return {
        id,
        number,
        clueNumbers,
        x,
        y,
        value,
        answer: answer.toUpperCase(),
        custom,
      };
    });
		return {
			...d,
			cells
		}
	});

	withCells.sort((a, b) => {
		if (a.direction < b.direction) return -1;
		else if (a.direction > b.direction) return 1;
		return a.number - b.number;
	});
	const withIndex = withCells.map((d, i) => ({
		...d,
		index: i
	}));
	return withIndex;
}

function createCells(data) {
  const cells = [].concat(...data.map(d => d.cells));
  let dict = {};

  // sort so that ones with number values come first and dedupe
  cells.sort((a, b) => a.y - b.y || a.x - b.x || b.number - a.number);
  cells.forEach((d) => {
    if (!dict[d.id]) {
      dict[d.id] = d;
    } else {
      // consolidate clue numbers for across & down
      dict[d.id].clueNumbers = {
        ...d.clueNumbers,
        ...dict[d.id].clueNumbers,
      };
      // consolidate custom classes
      if (dict[d.id].custom !== d.custom)
        dict[d.id].custom = `${dict[d.id].custom} ${d.custom}`;
    }
  });

  const unique = Object.keys(dict).map((d) => dict[d]);
  unique.sort((a, b) => a.y - b.y || a.x - b.x);
  // add index
  const output = unique.map((d, i) => ({ ...d, index: i }));
  return output;
}

function validateClues(data) {
	const props = [
    {
      prop: "clue",
      type: "string",
    },
    {
      prop: "answer",
      type: "string",
    },
    {
      prop: "x",
      type: "number",
    },
    {
      prop: "y",
      type: "number",
    }
  ];

	// only store if they fail
	let failedProp = false;
  data.forEach(d => !!props.map(p => {
		const f = typeof d[p.prop] !== p.type;
		if (f) {
			failedProp = true;
			console.error(`"${p.prop}" is not a ${p.type}\n`, d);
		}
	}));

	let failedCell = false;
	const cells = [].concat(...data.map(d => d.cells));
	
	let dict = {};
	cells.forEach((d) => {
    if (!dict[d.id]) {
      dict[d.id] = d.answer;
    } else {
			if (dict[d.id] !== d.answer) {
				failedCell = true;
				console.error(`cell "${d.id}" has two different values\n`, `${dict[d.id]} and ${d.answer}`);
			}
		}
  });

	return !failedProp && !failedCell;
}

function fromPairs(arr) {
  let res = {};
  arr.forEach((d) => {
    res[d[0]] = d[1];
  });
  return res;
}

var classic = {
	"text-font": "sans-serif",
	"bg": "transparent",
	"highlight-color": "#ffcc00",
	"secondary-color": "#ffec99",
	"order": "row",
	"clue-width": "16em",
	"clue-text-font": "var(--text-font, sans-serif)",
	"clue-text-color": "#1a1a1a",
	"clue-scrollbar-bg": "#efefef",
	"clue-scrollbar-fg": "#cdcdcd",
	"puzzle-border-color": "#1a1a1a",
	"cell-bg-color": "#fff",
	"cell-border-color": "#1a1a1a",
	"cell-void-color": "#1a1a1a",
	"cell-border-width": "0.01",
	"cell-text-font": "var(--text-font, sans-serif)",
	"cell-text-color": "#1a1a1a",
	"cell-text-size": "0.7em",
	"cell-text-weight": "700",
	"number-text-size": "0.3em",
	"number-text-weight": "400",
	"number-text-color": "#6a6a6a",
	"toolbar-text-font": "var(--text-font, sans-serif)",
	"toolbar-text-size": "0.85em",
	"toolbar-bg": "transparent",
	"toolbar-button-bg": "#efefef",
	"toolbar-button-bg-hover": "#cdcdcd",
	"toolbar-button-padding": "0.75em",
	"toolbar-button-border": "none",
	"toolbar-button-border-radius": "4px",
	"toolbar-button-text-color": "#6a6a6a",
	"toolbar-button-text-weight": "400",
	"message-text-font": "sans-serif",
	"message-text-size": "0.85em",
	"message-bg": "transparent",
	"message-button-bg": "#efefef",
	"message-button-bg-hover": "#cdcdcd",
	"message-button-padding": "0.75em",
	"message-button-border": "none",
	"message-button-border-radius": "4px",
	"message-button-text-color": "#6a6a6a",
	"message-button-text-weight": "400",
};

var dark = {
	"text-font": "sans-serif",
	"bg": "#1a1a1a",
	"highlight-color": "#066",
	"secondary-color": "#003d3d",
	"order": "row",
	"clue-width": "16em",
	"clue-text-font": "var(--text-font, sans-serif)",
	"clue-text-color": "#fff",
	"clue-scrollbar-bg": "#5a5a5a",
	"clue-scrollbar-fg": "#efefef",
	"puzzle-border-color": "#6a6a6a",
	"cell-bg-color": "#1a1a1a",
	"cell-border-color": "#6a6a6a",
	"cell-void-color": "#3a3a3a",
	"cell-border-width": "0.01",
	"cell-text-font": "var(--text-font, sans-serif)",
	"cell-text-color": "#fff",
	"cell-text-size": "0.7em",
	"cell-text-weight": "700",
	"number-text-size": "0.3em",
	"number-text-weight": "400",
	"number-text-color": "#cdcdcd",
	"toolbar-text-font": "var(--text-font, sans-serif)",
	"toolbar-text-size": "0.85em",
	"toolbar-bg": "transparent",
	"toolbar-button-bg": "#efefef",
	"toolbar-button-bg-hover": "#cdcdcd",
	"toolbar-button-padding": "0.75em",
	"toolbar-button-border": "none",
	"toolbar-button-border-radius": "4px",
	"toolbar-button-text-color": "#6a6a6a",
	"toolbar-button-text-weight": "400",
	"message-text-font": "sans-serif",
	"message-text-size": "0.85em",
	"message-bg": "transparent",
	"message-button-bg": "#efefef",
	"message-button-bg-hover": "#cdcdcd",
	"message-button-padding": "0.75em",
	"message-button-border": "none",
	"message-button-border-radius": "4px",
	"message-button-text-color": "#6a6a6a",
	"message-button-text-weight": "400",
};

var citrus = {
	"text-font": "sans-serif",
	"bg": "transparent",
	"highlight-color": "#ff957d",
	"secondary-color": "#ffdfd5",
	"order": "row",
	"clue-width": "16em",
	"clue-text-font": "var(--text-font, sans-serif)",
	"clue-text-color": "#184444",
	"clue-scrollbar-bg": "#ebf3f3",
	"clue-scrollbar-fg": "#c9d8d8",
	"puzzle-border-color": "#184444",
	"cell-bg-color": "#fff",
	"cell-border-color": "#184444",
	"cell-void-color": "#266b6b",
	"cell-border-width": "0.01",
	"cell-text-font": "var(--text-font, sans-serif)",
	"cell-text-color": "#184444",
	"cell-text-size": "0.7em",
	"cell-text-weight": "700",
	"number-text-size": "0.3em",
	"number-text-weight": "400",
	"number-text-color": "#266b6b",
	"toolbar-text-font": "var(--text-font, sans-serif)",
	"toolbar-text-size": "0.85em",
	"toolbar-bg": "transparent",
	"toolbar-button-bg": "#efefef",
	"toolbar-button-bg-hover": "#cdcdcd",
	"toolbar-button-padding": "0.75em",
	"toolbar-button-border": "none",
	"toolbar-button-border-radius": "4px",
	"toolbar-button-text-color": "#6a6a6a",
	"toolbar-button-text-weight": "400",
	"message-text-font": "sans-serif",
	"message-text-size": "0.85em",
	"message-bg": "transparent",
	"message-button-bg": "#efefef",
	"message-button-bg-hover": "#cdcdcd",
	"message-button-padding": "0.75em",
	"message-button-border": "none",
	"message-button-border-radius": "4px",
	"message-button-text-color": "#6a6a6a",
	"message-button-text-weight": "400",
};

const themes = { classic, dark, citrus };

Object.keys(themes).forEach((t) => {
	themes[t] = Object.keys(themes[t])
		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d]})`)
		.join(";");
});

/* node_modules/svelte-crossword/src/Crossword.svelte generated by Svelte v3.29.4 */

const css$b = {
	code: "article.svelte-1840iln{position:relative;background-color:var(--bg);font-size:16px}.play.svelte-1840iln{display:flex;flex-direction:var(--order, row)}.play.stacked.svelte-1840iln{flex-direction:column}",
	map: "{\"version\":3,\"file\":\"Crossword.svelte\",\"sources\":[\"Crossword.svelte\"],\"sourcesContent\":[\"<script>\\n  import Toolbar from \\\"./Toolbar.svelte\\\";\\n  import Puzzle from \\\"./Puzzle.svelte\\\";\\n  import Clues from \\\"./Clues.svelte\\\";\\n  import CompletedMessage from \\\"./CompletedMessage.svelte\\\";\\n  import createClues from \\\"./helpers/createClues.js\\\";\\n  import createCells from \\\"./helpers/createCells.js\\\";\\n  import validateClues from \\\"./helpers/validateClues.js\\\";\\n  import { fromPairs } from \\\"./helpers/utils.js\\\";\\n  import themeStyles from \\\"./helpers/themeStyles.js\\\";\\n\\n  export let data = [];\\n  export let actions = [\\\"clear\\\", \\\"reveal\\\"];\\n  export let theme = \\\"classic\\\";\\n  export let revealDuration = 1000;\\n  export let breakpoint = 720;\\n  export let revealed = false;\\n  export let disableHighlight = false;\\n  export let showCompleteMessage = true;\\n  export let showConfetti = true;\\n  export let showKeyboard = false;\\n\\n  let width = 0;\\n  let focusedDirection = \\\"across\\\";\\n  let focusedCellIndex = 0;\\n  let isRevealing = false;\\n  let revealTimeout;\\n  let clueCompletion;\\n\\n  let originalClues = [];\\n  let validated = [];\\n  let clues = [];\\n  let cells = [];\\n\\n  const onDataUpdate = () => {\\n    originalClues = createClues(data);\\n    validated = validateClues(originalClues);\\n    clues = originalClues.map((d) => ({ ...d }));\\n    cells = createCells(originalClues);\\n    reset();\\n  };\\n\\n  $: data, onDataUpdate();\\n  $: focusedCell = cells[focusedCellIndex] || {};\\n  $: cellIndexMap = fromPairs(cells.map((cell) => [cell.id, cell.index]));\\n  $: percentCorrect =\\n    cells.filter((d) => d.answer === d.value).length / cells.length;\\n  $: isComplete = percentCorrect == 1;\\n  $: isDisableHighlight = isComplete && disableHighlight;\\n  $: cells, (clues = checkClues());\\n  $: stacked = width < breakpoint;\\n  $: inlineStyles = themeStyles[theme];\\n\\n  function checkClues() {\\n    return clues.map((d) => {\\n      const index = d.index;\\n      const cellChecks = d.cells.map((c) => {\\n        const { value } = cells.find((e) => e.id === c.id);\\n        const hasValue = !!value;\\n        const hasCorrect = value === c.answer;\\n        return { hasValue, hasCorrect };\\n      });\\n      const isCorrect =\\n        cellChecks.filter((c) => c.hasCorrect).length === d.answer.length;\\n      const isFilled =\\n        cellChecks.filter((c) => c.hasValue).length === d.answer.length;\\n      return {\\n        ...d,\\n        isCorrect,\\n        isFilled,\\n      };\\n    });\\n  }\\n\\n  function reset() {\\n    isRevealing = false;\\n    focusedCellIndex = 0;\\n    focusedDirection = \\\"across\\\";\\n  }\\n\\n  function onClear() {\\n    reset();\\n    if (revealTimeout) clearTimeout(revealTimeout);\\n    cells = cells.map((cell) => ({\\n      ...cell,\\n      value: \\\"\\\",\\n    }));\\n    revealed = false;\\n  }\\n\\n  function onReveal() {\\n    if (revealed) return true;\\n    reset();\\n    cells = cells.map((cell) => ({\\n      ...cell,\\n      value: cell.answer,\\n    }));\\n    revealed = true;\\n    startReveal();\\n  }\\n\\n  function startReveal() {\\n    isRevealing = true;\\n    if (revealTimeout) clearTimeout(revealTimeout);\\n    revealTimeout = setTimeout(() => {\\n      isRevealing = false;\\n    }, revealDuration + 250);\\n  }\\n\\n  function onToolbarEvent({ detail }) {\\n    if (detail === \\\"clear\\\") onClear();\\n    else if (detail === \\\"reveal\\\") onReveal();\\n  }\\n</script>\\n\\n{#if validated}\\n  <article class=\\\"crossword\\\" bind:offsetWidth=\\\"{width}\\\" style=\\\"{inlineStyles}\\\">\\n    <slot name=\\\"toolbar\\\" onClear=\\\"{onClear}\\\" onReveal=\\\"{onReveal}\\\">\\n      <Toolbar actions=\\\"{actions}\\\" on:event=\\\"{onToolbarEvent}\\\" />\\n    </slot>\\n\\n    <div class=\\\"play\\\" class:stacked>\\n      <Clues\\n        clues=\\\"{clues}\\\"\\n        cellIndexMap=\\\"{cellIndexMap}\\\"\\n        stacked=\\\"{stacked}\\\"\\n        bind:focusedCellIndex\\n        bind:focusedCell\\n        bind:focusedDirection />\\n      <Puzzle\\n        clues=\\\"{clues}\\\"\\n        focusedCell=\\\"{focusedCell}\\\"\\n        isRevealing=\\\"{isRevealing}\\\"\\n        isDisableHighlight=\\\"{isDisableHighlight}\\\"\\n        revealDuration=\\\"{revealDuration}\\\"\\n        showKeyboard=\\\"{showKeyboard}\\\"\\n        stacked=\\\"{stacked}\\\"\\n        bind:cells\\n        bind:focusedCellIndex\\n        bind:focusedDirection />\\n    </div>\\n\\n    {#if isComplete && !isRevealing && showCompleteMessage}\\n      <CompletedMessage showConfetti=\\\"{showConfetti}\\\">\\n        <slot name=\\\"complete\\\" />\\n      </CompletedMessage>\\n    {/if}\\n  </article>\\n{/if}\\n\\n<style>\\n  article {\\n    position: relative;\\n    background-color: var(--bg);\\n    font-size: 16px;\\n  }\\n\\n  .play {\\n    display: flex;\\n    flex-direction: var(--order, row);\\n  }\\n\\n  .play.stacked {\\n    flex-direction: column;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAuJE,OAAO,eAAC,CAAC,AACP,QAAQ,CAAE,QAAQ,CAClB,gBAAgB,CAAE,IAAI,IAAI,CAAC,CAC3B,SAAS,CAAE,IAAI,AACjB,CAAC,AAED,KAAK,eAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,IAAI,OAAO,CAAC,IAAI,CAAC,AACnC,CAAC,AAED,KAAK,QAAQ,eAAC,CAAC,AACb,cAAc,CAAE,MAAM,AACxB,CAAC\"}"
};

const Crossword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { data = [] } = $$props;
	let { actions = ["clear", "reveal"] } = $$props;
	let { theme = "classic" } = $$props;
	let { revealDuration = 1000 } = $$props;
	let { breakpoint = 720 } = $$props;
	let { revealed = false } = $$props;
	let { disableHighlight = false } = $$props;
	let { showCompleteMessage = true } = $$props;
	let { showConfetti = true } = $$props;
	let { showKeyboard = false } = $$props;
	let width = 0;
	let focusedDirection = "across";
	let focusedCellIndex = 0;
	let isRevealing = false;
	let revealTimeout;
	let originalClues = [];
	let validated = [];
	let clues = [];
	let cells = [];

	const onDataUpdate = () => {
		originalClues = createClues(data);
		validated = validateClues(originalClues);
		clues = originalClues.map(d => ({ ...d }));
		cells = createCells(originalClues);
		reset();
	};

	function checkClues() {
		return clues.map(d => {
			const index = d.index;

			const cellChecks = d.cells.map(c => {
				const { value } = cells.find(e => e.id === c.id);
				const hasValue = !!value;
				const hasCorrect = value === c.answer;
				return { hasValue, hasCorrect };
			});

			const isCorrect = cellChecks.filter(c => c.hasCorrect).length === d.answer.length;
			const isFilled = cellChecks.filter(c => c.hasValue).length === d.answer.length;
			return { ...d, isCorrect, isFilled };
		});
	}

	function reset() {
		isRevealing = false;
		focusedCellIndex = 0;
		focusedDirection = "across";
	}

	function onClear() {
		reset();
		if (revealTimeout) clearTimeout(revealTimeout);
		cells = cells.map(cell => ({ ...cell, value: "" }));
		revealed = false;
	}

	function onReveal() {
		if (revealed) return true;
		reset();
		cells = cells.map(cell => ({ ...cell, value: cell.answer }));
		revealed = true;
		startReveal();
	}

	function startReveal() {
		isRevealing = true;
		if (revealTimeout) clearTimeout(revealTimeout);

		revealTimeout = setTimeout(
			() => {
				isRevealing = false;
			},
			revealDuration + 250
		);
	}

	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.actions === void 0 && $$bindings.actions && actions !== void 0) $$bindings.actions(actions);
	if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
	if ($$props.revealDuration === void 0 && $$bindings.revealDuration && revealDuration !== void 0) $$bindings.revealDuration(revealDuration);
	if ($$props.breakpoint === void 0 && $$bindings.breakpoint && breakpoint !== void 0) $$bindings.breakpoint(breakpoint);
	if ($$props.revealed === void 0 && $$bindings.revealed && revealed !== void 0) $$bindings.revealed(revealed);
	if ($$props.disableHighlight === void 0 && $$bindings.disableHighlight && disableHighlight !== void 0) $$bindings.disableHighlight(disableHighlight);
	if ($$props.showCompleteMessage === void 0 && $$bindings.showCompleteMessage && showCompleteMessage !== void 0) $$bindings.showCompleteMessage(showCompleteMessage);
	if ($$props.showConfetti === void 0 && $$bindings.showConfetti && showConfetti !== void 0) $$bindings.showConfetti(showConfetti);
	if ($$props.showKeyboard === void 0 && $$bindings.showKeyboard && showKeyboard !== void 0) $$bindings.showKeyboard(showKeyboard);
	$$result.css.add(css$b);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		let focusedCell;
		let cellIndexMap;
		let percentCorrect;
		let isComplete;
		let isDisableHighlight;
		let stacked;
		let inlineStyles;

		 {
			(onDataUpdate());
		}

		focusedCell = cells[focusedCellIndex] || {};
		cellIndexMap = fromPairs(cells.map(cell => [cell.id, cell.index]));
		percentCorrect = cells.filter(d => d.answer === d.value).length / cells.length;
		isComplete = percentCorrect == 1;
		isDisableHighlight = isComplete && disableHighlight;

		 {
			(clues = checkClues());
		}

		stacked = width < breakpoint;
		inlineStyles = themes[theme];

		$$rendered = `${validated
		? `<article class="${"crossword svelte-1840iln"}"${add_attribute("style", inlineStyles, 0)}>${slots.toolbar
			? slots.toolbar({ onClear, onReveal })
			: `
      ${validate_component(Toolbar, "Toolbar").$$render($$result, { actions }, {}, {})}
    `}

    <div class="${["play svelte-1840iln", stacked ? "stacked" : ""].join(" ").trim()}">${validate_component(Clues, "Clues").$$render(
				$$result,
				{
					clues,
					cellIndexMap,
					stacked,
					focusedCellIndex,
					focusedCell,
					focusedDirection
				},
				{
					focusedCellIndex: $$value => {
						focusedCellIndex = $$value;
						$$settled = false;
					},
					focusedCell: $$value => {
						focusedCell = $$value;
						$$settled = false;
					},
					focusedDirection: $$value => {
						focusedDirection = $$value;
						$$settled = false;
					}
				},
				{}
			)}
      ${validate_component(Puzzle, "Puzzle").$$render(
				$$result,
				{
					clues,
					focusedCell,
					isRevealing,
					isDisableHighlight,
					revealDuration,
					showKeyboard,
					stacked,
					cells,
					focusedCellIndex,
					focusedDirection
				},
				{
					cells: $$value => {
						cells = $$value;
						$$settled = false;
					},
					focusedCellIndex: $$value => {
						focusedCellIndex = $$value;
						$$settled = false;
					},
					focusedDirection: $$value => {
						focusedDirection = $$value;
						$$settled = false;
					}
				},
				{}
			)}</div>

    ${isComplete && !isRevealing && showCompleteMessage
			? `${validate_component(CompletedMessage, "CompletedMessage").$$render($$result, { showConfetti }, {}, {
					default: () => `${slots.complete ? slots.complete({}) : ``}`
				})}`
			: ``}</article>`
		: ``}`;
	} while (!$$settled);

	return $$rendered;
});

/* src/components/Play.svelte generated by Svelte v3.29.4 */

const css$c = {
	code: "section.svelte-mmi6yn{max-width:960px;margin:3em auto}.citrus.svelte-mmi6yn{background-color:azure}.info.svelte-mmi6yn{text-align:center}h2.svelte-mmi6yn{font-size:2em}.xd.svelte-mmi6yn{max-width:800px;margin:0 auto;font-family:--sans}.insight.svelte-mmi6yn{max-width:var(--column-width);margin:1em auto;font-size:1em;line-height:1.8}span.svelte-mmi6yn{font-weight:700}button.svelte-mmi6yn{opacity:0.5}.note.svelte-mmi6yn{max-width:800px;font-family:var(--sans);text-align:right}",
	map: "{\"version\":3,\"file\":\"Play.svelte\",\"sources\":[\"Play.svelte\"],\"sourcesContent\":[\"<script>\\n  import Crossword from \\\"svelte-crossword\\\";\\n  export let id;\\n  export let title;\\n  export let theme = \\\"classic\\\";\\n  export let puzzles = [];\\n\\n  let current = puzzles[0].id;\\n\\n  function addCustom(arr) {\\n    return arr.map((d) => ({\\n      ...d,\\n      custom: `${d.race} ${d.gender}`,\\n    }));\\n  }\\n\\n  $: puzzle = puzzles.find((d) => d.id === current);\\n  $: name = puzzle.value;\\n  $: data = addCustom(puzzle.data);\\n</script>\\n\\n<section id=\\\"{id}\\\" class=\\\"{theme}\\\">\\n  <div class=\\\"info\\\">\\n    <h2>{title}</h2>\\n    <select bind:value=\\\"{current}\\\">\\n      {#each puzzles as { id, value }}\\n        <option value=\\\"{id}\\\">{value}</option>\\n      {/each}\\n    </select>\\n  </div>\\n\\n  <p class=\\\"insight\\\">\\n    In our sample of people in\\n    {name}\\n    puzzles, we found that...\\n    <br />\\n    <button class=\\\"urm\\\"><span class=\\\"percent\\\">30%</span>\\n      were underrepresented minorities</button>\\n    and\\n    <button class=\\\"women\\\"><span class=\\\"percent\\\">10%</span> were women.</button>\\n  </p>\\n\\n  <div class=\\\"xd\\\">\\n    <Crossword data=\\\"{data}\\\" theme=\\\"{theme}\\\" />\\n    <p class=\\\"note\\\">\\n      <em>Note: findings were rounded to the nearest 10% in order to map to the\\n        10 clues.</em>\\n    </p>\\n  </div>\\n</section>\\n\\n<style>\\n  section {\\n    max-width: 960px;\\n    margin: 3em auto;\\n  }\\n\\n  .citrus {\\n    background-color: azure;\\n  }\\n\\n  .info {\\n    text-align: center;\\n  }\\n\\n  h2 {\\n    font-size: 2em;\\n  }\\n\\n  .xd {\\n    max-width: 800px;\\n    margin: 0 auto;\\n    font-family: --sans;\\n  }\\n\\n  .insight {\\n    max-width: var(--column-width);\\n    margin: 1em auto;\\n    font-size: 1em;\\n    line-height: 1.8;\\n  }\\n\\n  span {\\n    font-weight: 700;\\n  }\\n\\n  button {\\n    opacity: 0.5;\\n  }\\n\\n  .note {\\n    max-width: 800px;\\n    font-family: var(--sans);\\n    text-align: right;\\n  }</style>\\n\"],\"names\":[],\"mappings\":\"AAoDE,OAAO,cAAC,CAAC,AACP,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,GAAG,CAAC,IAAI,AAClB,CAAC,AAED,OAAO,cAAC,CAAC,AACP,gBAAgB,CAAE,KAAK,AACzB,CAAC,AAED,KAAK,cAAC,CAAC,AACL,UAAU,CAAE,MAAM,AACpB,CAAC,AAED,EAAE,cAAC,CAAC,AACF,SAAS,CAAE,GAAG,AAChB,CAAC,AAED,GAAG,cAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,WAAW,CAAE,CAAC,KAAK,AACrB,CAAC,AAED,QAAQ,cAAC,CAAC,AACR,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,MAAM,CAAE,GAAG,CAAC,IAAI,CAChB,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,IAAI,cAAC,CAAC,AACJ,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,MAAM,cAAC,CAAC,AACN,OAAO,CAAE,GAAG,AACd,CAAC,AAED,KAAK,cAAC,CAAC,AACL,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,IAAI,MAAM,CAAC,CACxB,UAAU,CAAE,KAAK,AACnB,CAAC\"}"
};

function addCustom(arr) {
	return arr.map(d => ({ ...d, custom: `${d.race} ${d.gender}` }));
}

const Play = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { id } = $$props;
	let { title } = $$props;
	let { theme = "classic" } = $$props;
	let { puzzles = [] } = $$props;
	let current = puzzles[0].id;
	if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
	if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
	if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
	if ($$props.puzzles === void 0 && $$bindings.puzzles && puzzles !== void 0) $$bindings.puzzles(puzzles);
	$$result.css.add(css$c);
	let puzzle;
	let name;
	let data;
	puzzle = puzzles.find(d => d.id === current);
	name = puzzle.value;
	data = addCustom(puzzle.data);

	return `<section${add_attribute("id", id, 0)} class="${escape(null_to_empty(theme)) + " svelte-mmi6yn"}"><div class="${"info svelte-mmi6yn"}"><h2 class="${"svelte-mmi6yn"}">${escape(title)}</h2>
    <select${add_attribute("value", current, 1)}>${each(puzzles, ({ id, value }) => `<option${add_attribute("value", id, 0)}>${escape(value)}</option>`)}</select></div>

  <p class="${"insight svelte-mmi6yn"}">In our sample of people in
    ${escape(name)}
    puzzles, we found that...
    <br>
    <button class="${"urm svelte-mmi6yn"}"><span class="${"percent svelte-mmi6yn"}">30%</span>
      were underrepresented minorities</button>
    and
    <button class="${"women svelte-mmi6yn"}"><span class="${"percent svelte-mmi6yn"}">10%</span> were women.</button></p>

  <div class="${"xd svelte-mmi6yn"}">${validate_component(Crossword, "Crossword").$$render($$result, { data, theme }, {}, {})}
    <p class="${"note svelte-mmi6yn"}"><em>Note: findings were rounded to the nearest 10% in order to map to the
        10 clues.</em></p></div>
</section>`;
});

var usa2020 = [
	{
		x: 0,
		y: 0,
		answer: "TRACE",
		direction: "across",
		clue: "\"Hustlers\" actress Lysette",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Trace Lysette",
		wiki: "https://en.wikipedia.org/wiki/Trace_Lysette",
		description: "American actor"
	},
	{
		x: 2,
		y: 0,
		answer: "ANITA",
		direction: "down",
		clue: "Rita's role in \"West Side Story\"",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "woman",
		name: "Rita Moreno",
		wiki: "https://en.wikipedia.org/wiki/Rita_Moreno",
		description: "Puerto Rican singer, dancer, and actress"
	},
	{
		x: 3,
		y: 0,
		answer: "CHE",
		direction: "down",
		clue: "Guerrilla Guevara",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "man",
		name: "Che Guevara",
		wiki: "https://en.wikipedia.org/wiki/Che_Guevara",
		description: "Argentine Marxist revolutionary"
	},
	{
		x: 4,
		y: 0,
		answer: "ELL",
		direction: "down",
		clue: "\"I Don't Love You\" singer Lindsay",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Lindsay Ell",
		wiki: "https://en.wikipedia.org/wiki/Lindsay_Ell",
		description: "Canadian musician"
	},
	{
		x: 2,
		y: 1,
		answer: "NHL",
		direction: "across",
		clue: "Willie O'Ree played in it (Abbr.)",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Willie O'Ree",
		wiki: "https://en.wikipedia.org/wiki/Willie_O%27Ree",
		description: "20th-century Canadian ice hockey player"
	},
	{
		x: 0,
		y: 2,
		answer: "ARIEL",
		direction: "across",
		clue: "\"Modern Family\" actress Winter",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Ariel Winter",
		wiki: "https://en.wikipedia.org/wiki/Ariel_Winter",
		description: "American actress, model and occasional singer"
	},
	{
		x: 0,
		y: 2,
		answer: "ALI",
		direction: "down",
		clue: "Broadway star Stroker",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Ali Stroker",
		wiki: "https://en.wikipedia.org/wiki/Ali_Stroker",
		description: "American actress"
	},
	{
		x: 1,
		y: 2,
		answer: "REC",
		direction: "down",
		clue: "\"Parks and ___\" (Amy Poehler sitcom, for short)",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Amy Poehler",
		wiki: "https://en.wikipedia.org/wiki/Amy_Poehler",
		description: "American actress"
	},
	{
		x: 0,
		y: 3,
		answer: "LET",
		direction: "across",
		clue: "\"___ America Be America Again\" (Langston Hughes poem)",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Langston Hughes",
		wiki: "https://en.wikipedia.org/wiki/Langston_Hughes",
		description: "American writer and social activist"
	},
	{
		x: 0,
		y: 4,
		answer: "ICARE",
		direction: "across",
		clue: "Beyonce song about emotional investment",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Beyoncé",
		wiki: "https://en.wikipedia.org/wiki/Beyonc%C3%A9",
		description: "American singer, songwriter, producer, and actress"
	}
];

var up2020 = [
	{
		x: 1,
		y: 0,
		answer: "ALDA",
		direction: "across",
		clue: "Hawkeye Pierce portrayer Alan",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Alan Alda",
		wiki: "https://en.wikipedia.org/wiki/Alan_Alda",
		description: "American actor, director, screenwriter, comedian and author"
	},
	{
		x: 2,
		y: 0,
		answer: "LILLY",
		direction: "down",
		clue: "Pharmaceuticals giant ___ Lilly",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Eli Lilly",
		wiki: "https://en.wikipedia.org/wiki/Eli_Lilly",
		description: "American pharmacist, Union Army officer, businessman, philanthropist"
	},
	{
		x: 3,
		y: 0,
		answer: "DAE",
		direction: "down",
		clue: "Daniel ___ Kim of \"Lost\"",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Daniel Dae Kim",
		wiki: "https://en.wikipedia.org/wiki/Daniel_Dae_Kim",
		description: "Korean American actor"
	},
	{
		x: 4,
		y: 0,
		answer: "ANNA",
		direction: "down",
		clue: "Author ___ J. Cooper",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Anna J. Cooper",
		wiki: "https://en.wikipedia.org/wiki/Anna_J._Cooper",
		description: "African-American author, educator, speaker and scholar"
	},
	{
		x: 0,
		y: 1,
		answer: "SADE",
		direction: "down",
		clue: "\"The Sweetest Taboo\" singer",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Sade",
		wiki: "https://en.wikipedia.org/wiki/Sade_(singer)",
		description: "Nigerian singer and songwriter"
	},
	{
		x: 2,
		y: 1,
		answer: "IAN",
		direction: "across",
		clue: "\"At Seventeen\" singer Janis",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Janis Ian",
		wiki: "https://en.wikipedia.org/wiki/Janis_Ian",
		description: "American singer-songwriter and writer"
	},
	{
		x: 0,
		y: 2,
		answer: "ALLEN",
		direction: "across",
		clue: "Patriot Ethan",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ethan Allen",
		wiki: "https://en.wikipedia.org/wiki/Ethan_Allen",
		description: "18th-century American general"
	},
	{
		x: 1,
		y: 2,
		answer: "LEN",
		direction: "down",
		clue: "Spy novelist Deighton",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Len Deighton",
		wiki: "https://en.wikipedia.org/wiki/Len_Deighton",
		description: "British author"
	},
	{
		x: 0,
		y: 3,
		answer: "DEL",
		direction: "across",
		clue: "Singer Del Rey",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Lana Del Rey",
		wiki: "https://en.wikipedia.org/wiki/Lana_Del_Rey",
		description: "American singer-songwriter"
	},
	{
		x: 0,
		y: 4,
		answer: "ENYA",
		direction: "across",
		clue: "One-named Irish singer",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Enya",
		wiki: "https://en.wikipedia.org/wiki/Enya",
		description: "Irish singer, songwriter, and musician"
	}
];

var nyt2020 = [
	{
		x: 2,
		y: 0,
		answer: "RAY",
		direction: "across",
		clue: "Dadaism pioneer",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Man Ray",
		wiki: "https://en.wikipedia.org/wiki/Man_Ray",
		description: "American artist and photographer"
	},
	{
		x: 2,
		y: 0,
		answer: "RODIN",
		direction: "down",
		clue: "\"The Thinker\" sculptor",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Auguste Rodin",
		wiki: "https://en.wikipedia.org/wiki/Auguste_Rodin",
		description: "French sculptor"
	},
	{
		x: 3,
		y: 0,
		answer: "ARI",
		direction: "down",
		clue: "Horror film director Aster",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ari Aster",
		wiki: "https://en.wikipedia.org/wiki/Ari_Aster",
		description: "American filmmaker and screenwriter"
	},
	{
		x: 4,
		y: 0,
		answer: "YANN",
		direction: "down",
		clue: "\"Life of Pi\" author Martel",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Yann Martel",
		wiki: "https://en.wikipedia.org/wiki/Yann_Martel",
		description: "Canadian author best known for the book Life of Pi"
	},
	{
		x: 0,
		y: 1,
		answer: "ERMA",
		direction: "down",
		clue: "Bombeck who wrote \"I Lost Everything in the Post-Natal Depression\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Erma Bombeck",
		wiki: "https://en.wikipedia.org/wiki/Erma_Bombeck",
		description: "American humorist and writer"
	},
	{
		x: 2,
		y: 1,
		answer: "ORA",
		direction: "across",
		clue: "Pop singer Ora",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Rita Ora",
		wiki: "https://en.wikipedia.org/wiki/Rita_Ora",
		description: "British singer and actress"
	},
	{
		x: 0,
		y: 2,
		answer: "RIDIN",
		direction: "across",
		clue: "2006 #1 Chamillionaire hit that begins \"They see me rollin'\"",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Chamillionaire",
		wiki: "https://en.wikipedia.org/wiki/Chamillionaire",
		description: "American rapper, entrepreneur, and investor from Texas"
	},
	{
		x: 1,
		y: 2,
		answer: "IAN",
		direction: "down",
		clue: "Novelist McEwan",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ian McEwan",
		wiki: "https://en.wikipedia.org/wiki/Ian_McEwan",
		description: "British author"
	},
	{
		x: 0,
		y: 3,
		answer: "MAI",
		direction: "across",
		clue: "Singer Ella with the 2018 Grammy-winning R&B hit \"Boo'd Up\"",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Ella Mai",
		wiki: "https://en.wikipedia.org/wiki/Ella_Mai",
		description: "English singer"
	},
	{
		x: 0,
		y: 4,
		answer: "ANN",
		direction: "across",
		clue: "___ Petry, first female African-American writer with a million-selling novel (\"The Street\")",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Ann Petry",
		wiki: "https://en.wikipedia.org/wiki/Ann_Petry",
		description: "American writer and journalist"
	}
];

var lat2020 = [
	{
		x: 0,
		y: 0,
		answer: "KAREN",
		direction: "across",
		clue: "Actress Gillan of \"Guardians of the Galaxy\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Karen Gillan",
		wiki: "https://en.wikipedia.org/wiki/Karen_Gillan",
		description: "Scottish actress, director and screenwriter"
	},
	{
		x: 1,
		y: 0,
		answer: "ADELE",
		direction: "down",
		clue: "Singer with numbered albums",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Adele",
		wiki: "https://en.wikipedia.org/wiki/Adele",
		description: "English singer-songwriter"
	},
	{
		x: 2,
		y: 0,
		answer: "RENEE",
		direction: "down",
		clue: "Soprano Fleming",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Renée Fleming",
		wiki: "https://en.wikipedia.org/wiki/Ren%C3%A9e_Fleming",
		description: "American opera soprano"
	},
	{
		x: 3,
		y: 0,
		answer: "ELIEL",
		direction: "down",
		clue: "Architect Saarinen",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Eliel Saarinen",
		wiki: "https://en.wikipedia.org/wiki/Eliel_Saarinen",
		description: "Finnish-American architect (1873-1950)"
	},
	{
		x: 1,
		y: 1,
		answer: "DEL",
		direction: "across",
		clue: "\"The Shape of Water\" director",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "man",
		name: "Guillermo del Toro",
		wiki: "https://en.wikipedia.org/wiki/Guillermo_del_Toro",
		description: "Mexican filmmaker and author"
	},
	{
		x: 0,
		y: 2,
		answer: "DENIS",
		direction: "across",
		clue: "Comic Denis",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Denis Leary",
		wiki: "https://en.wikipedia.org/wiki/Denis_Leary",
		description: "American actor and comedian"
	},
	{
		x: 1,
		y: 3,
		answer: "LEE",
		direction: "across",
		clue: "Poe's \"Annabel __\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Edgar Allan Poe",
		wiki: "https://en.wikipedia.org/wiki/Edgar_Allan_Poe",
		description: "19th-century American author, poet, editor and literary critic"
	},
	{
		x: 0,
		y: 4,
		answer: "PEELE",
		direction: "across",
		clue: "\"The Twilight Zone\" (2019) host Jordan",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Jordan Peele",
		wiki: "https://en.wikipedia.org/wiki/Jordan_Peele",
		description: "American actor, comedian, writer, and director"
	}
];

var wsj2020 = [
	{
		x: 0,
		y: 0,
		answer: "QUINN",
		direction: "across",
		clue: "\"Elementary\" actor Quinn",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Aidan Quinn",
		wiki: "https://en.wikipedia.org/wiki/Aidan_Quinn",
		description: "American actor"
	},
	{
		x: 2,
		y: 0,
		answer: "IRENE",
		direction: "down",
		clue: "Marie Curie's scientist daughter",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Irène Joliot-Curie",
		wiki: "https://en.wikipedia.org/wiki/Ir%C3%A8ne_Joliot-Curie",
		description: "French scientist"
	},
	{
		x: 3,
		y: 0,
		answer: "NAS",
		direction: "down",
		clue: "Lil ___ X (\"Rodeo\" rapper)",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Lil Nas X",
		wiki: "https://en.wikipedia.org/wiki/Lil_Nas_X",
		description: "American rapper, singer, and songwriter from Georgia"
	},
	{
		x: 4,
		y: 0,
		answer: "NYE",
		direction: "down",
		clue: "Bill of scientific information",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Bill Nye",
		wiki: "https://en.wikipedia.org/wiki/Bill_Nye",
		description: "American science educator, comedian, television host, actor, writer, scientist and former mechanical engineer"
	},
	{
		x: 2,
		y: 1,
		answer: "RAY",
		direction: "across",
		clue: "Ray who's the subject of the 2016 biopic \"The Founder\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ray Kroc",
		wiki: "https://en.wikipedia.org/wiki/Ray_Kroc",
		description: "American businessman"
	},
	{
		x: 0,
		y: 2,
		answer: "REESE",
		direction: "across",
		clue: "She played June to Joaquin's Johnny",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Reese Witherspoon",
		wiki: "https://en.wikipedia.org/wiki/Reese_Witherspoon",
		description: "American actress and producer"
	},
	{
		x: 0,
		y: 2,
		answer: "RAP",
		direction: "down",
		clue: "Drake's forte",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Drake",
		wiki: "https://en.wikipedia.org/wiki/Drake_(musician)",
		description: "Canadian rapper, singer, songwriter, and actor"
	},
	{
		x: 1,
		y: 2,
		answer: "ENO",
		direction: "down",
		clue: "Musician who composed the Windows 95 start-up chime",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Brian Eno",
		wiki: "https://en.wikipedia.org/wiki/Brian_Eno",
		description: "English musician, composer, record producer and visual artist"
	},
	{
		x: 0,
		y: 3,
		answer: "ANN",
		direction: "across",
		clue: "\"Bel Canto\" author Patchett",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Ann Patchett",
		wiki: "https://en.wikipedia.org/wiki/Ann_Patchett",
		description: "American novelist and memoirist"
	},
	{
		x: 0,
		y: 4,
		answer: "POEMS",
		direction: "across",
		clue: "Frost lines",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Robert Frost",
		wiki: "https://en.wikipedia.org/wiki/Robert_Frost",
		description: "American poet"
	}
];

var nyt1940s = [
	{
		x: 1,
		y: 0,
		answer: "KERR",
		direction: "across",
		clue: "Deborah ___.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Deborah Kerr",
		wiki: "https://en.wikipedia.org/wiki/Deborah_Kerr",
		description: "British film and television actress"
	},
	{
		x: 2,
		y: 0,
		answer: "ELMER",
		direction: "down",
		clue: "Newsman Davis.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Elmer Davis",
		wiki: "https://en.wikipedia.org/wiki/Elmer_Davis",
		description: "American politician"
	},
	{
		x: 3,
		y: 0,
		answer: "RIO",
		direction: "down",
		clue: "President Carlos Arroyo Del ___ of Ecuador.",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "man",
		name: "Carlos Alberto Arroyo del Rio",
		wiki: "https://en.wikipedia.org/wiki/Carlos_Alberto_Arroyo_del_R%C3%ADo",
		description: "President of Ecuador (1939) / (1940 - 1944)"
	},
	{
		x: 4,
		y: 0,
		answer: "RENE",
		direction: "down",
		clue: "\"Good King ___.\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "René of Anjou",
		wiki: "https://en.wikipedia.org/wiki/Ren%C3%A9_of_Anjou",
		description: "15th-century French prince, briefly King of Naples"
	},
	{
		x: 0,
		y: 1,
		answer: "TSAR",
		direction: "down",
		clue: "He died at Ekaterinburg, 1918.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Nicholas II of Russia",
		wiki: "https://en.wikipedia.org/wiki/Nicholas_II_of_Russia",
		description: "Emperor of All Russia"
	},
	{
		x: 2,
		y: 1,
		answer: "LIE",
		direction: "across",
		clue: "Mr. Lie.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Trygve Lie",
		wiki: "https://en.wikipedia.org/wiki/Trygve_Lie",
		description: "1st Secretary-General of the United Nations"
	},
	{
		x: 0,
		y: 2,
		answer: "SIMON",
		direction: "across",
		clue: "British Foreign Secretary, 1931–35.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "John Simon",
		wiki: "https://en.wikipedia.org/wiki/John_Simon,_1st_Viscount_Simon",
		description: "British politician"
	},
	{
		x: 1,
		y: 2,
		answer: "IRA",
		direction: "down",
		clue: "___ Gershwin.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ira Gershwin",
		wiki: "https://en.wikipedia.org/wiki/Ira_Gershwin",
		description: "American lyricist (1896-1983)"
	},
	{
		x: 0,
		y: 3,
		answer: "ARE",
		direction: "across",
		clue: "Second note of Guido's scale.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Guido of Arezzo",
		wiki: "https://en.wikipedia.org/wiki/Guido_of_Arezzo",
		description: "11th century Italian monk, inventor of musical notaticulo"
	},
	{
		x: 0,
		y: 4,
		answer: "RARE",
		direction: "across",
		clue: "\"Success is a ___ paint\"—Suckling.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "John Suckling",
		wiki: "https://en.wikipedia.org/wiki/John_Suckling_(poet)",
		description: "17th-century English poet and playwright"
	}
];

var nyt1950s = [
	{
		x: 2,
		y: 0,
		answer: "ORR",
		direction: "across",
		clue: "Lord Boyd ___.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "John Boyd Orr",
		wiki: "https://en.wikipedia.org/wiki/John_Boyd_Orr",
		description: "Scottish nutritionist, Director-General of the United Nations Food and Agriculture Organization (1880-1971)"
	},
	{
		x: 2,
		y: 0,
		answer: "OWENS",
		direction: "down",
		clue: "U. S. track star.",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Jesse Owens",
		wiki: "https://en.wikipedia.org/wiki/Jesse_Owens",
		description: "American track and field athlete"
	},
	{
		x: 3,
		y: 0,
		answer: "RENI",
		direction: "down",
		clue: "Italian painter.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Guido Reni",
		wiki: "https://en.wikipedia.org/wiki/Guido_Reni",
		description: "17th-century Bolognese painter"
	},
	{
		x: 4,
		y: 0,
		answer: "RYAN",
		direction: "down",
		clue: "Star of \"Men in War.\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Robert Ryan",
		wiki: "https://en.wikipedia.org/wiki/Robert_Ryan",
		description: "American actor"
	},
	{
		x: 0,
		y: 1,
		answer: "DEWEY",
		direction: "across",
		clue: "Noted librarian.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Melvil Dewey",
		wiki: "https://en.wikipedia.org/wiki/Melvil_Dewey",
		description: "American librarian and educator"
	},
	{
		x: 0,
		y: 1,
		answer: "DELA",
		direction: "down",
		clue: "Mazo ___ Roche.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Mazo de la Roche",
		wiki: "https://en.wikipedia.org/wiki/Mazo_de_la_Roche",
		description: "Canadian writer"
	},
	{
		x: 1,
		y: 1,
		answer: "ELEE",
		direction: "down",
		clue: "Robert ___.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Robert E. Lee",
		wiki: "https://en.wikipedia.org/wiki/Robert_E._Lee",
		description: "Confederate States Army commander"
	},
	{
		x: 0,
		y: 2,
		answer: "ELENA",
		direction: "across",
		clue: "Former Queen of Italy.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Elena of Montenegro",
		wiki: "https://en.wikipedia.org/wiki/Elena_of_Montenegro",
		description: "Queen consort of Italy"
	},
	{
		x: 0,
		y: 3,
		answer: "LENIN",
		direction: "across",
		clue: "Vladimir Ilich Ulianov.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Vladimir Lenin",
		wiki: "https://en.wikipedia.org/wiki/Vladimir_Lenin",
		description: "Russian politician, communist theorist, and founder of the Soviet Union"
	},
	{
		x: 0,
		y: 4,
		answer: "AES",
		direction: "across",
		clue: "Political monogram.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Adlai Stevenson II",
		wiki: "https://en.wikipedia.org/wiki/Adlai_Stevenson_II",
		description: "American politician"
	}
];

var nyt1960s = [
	{
		x: 0,
		y: 0,
		answer: "READE",
		direction: "across",
		clue: "British novelist.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Charles Reade",
		wiki: "https://en.wikipedia.org/wiki/Charles_Reade",
		description: "British writer"
	},
	{
		x: 2,
		y: 0,
		answer: "ALLEN",
		direction: "down",
		clue: "Famous TV pioneer.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Allen B. DuMont",
		wiki: "https://en.wikipedia.org/wiki/Allen_B._DuMont",
		description: "American electronics engineer and inventor"
	},
	{
		x: 3,
		y: 0,
		answer: "DEL",
		direction: "down",
		clue: "Del Sarto of Florence.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Andrea del Sarto",
		wiki: "https://en.wikipedia.org/wiki/Andrea_del_Sarto",
		description: "Italian painter (1486-1530)"
	},
	{
		x: 4,
		y: 0,
		answer: "EVA",
		direction: "down",
		clue: "Stowe character.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Harriet Beecher Stowe",
		wiki: "https://en.wikipedia.org/wiki/Harriet_Beecher_Stowe",
		description: "19th-century American abolitionist and author"
	},
	{
		x: 2,
		y: 1,
		answer: "LEV",
		direction: "across",
		clue: "Real first name of 38 Down.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Leon Trotsky",
		wiki: "https://en.wikipedia.org/wiki/Leon_Trotsky",
		description: "Marxist revolutionary from Ukraine"
	},
	{
		x: 0,
		y: 2,
		answer: "FALLA",
		direction: "across",
		clue: "Composer de Falla.",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "man",
		name: "Manuel de Falla",
		wiki: "https://en.wikipedia.org/wiki/Manuel_de_Falla",
		description: "Spanish composer (1876-1946)"
	},
	{
		x: 0,
		y: 2,
		answer: "FDR",
		direction: "down",
		clue: "The 6c stamp man.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Franklin D. Roosevelt",
		wiki: "https://en.wikipedia.org/wiki/Franklin_D._Roosevelt",
		description: "32nd president of the United States"
	},
	{
		x: 1,
		y: 2,
		answer: "ADE",
		direction: "down",
		clue: "American humorist.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "George Ade",
		wiki: "https://en.wikipedia.org/wiki/George_Ade",
		description: "American writer, newspaper columnist and playwright"
	},
	{
		x: 0,
		y: 3,
		answer: "DDE",
		direction: "across",
		clue: "Presidential initials.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Dwight D. Eisenhower",
		wiki: "https://en.wikipedia.org/wiki/Dwight_D._Eisenhower",
		description: "American army general and 34th president of the United States (1890–1969)"
	},
	{
		x: 0,
		y: 4,
		answer: "RENES",
		direction: "across",
		clue: "Descartes and others.",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "René Descartes",
		wiki: "https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes",
		description: "17th-century French philosopher, mathematician, and scientist"
	}
];

var nyt1970s = [
	{
		x: 2,
		y: 0,
		answer: "ABE",
		direction: "across",
		clue: "Man from Illinois",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Abraham Lincoln",
		wiki: "https://en.wikipedia.org/wiki/Abraham_Lincoln",
		description: "American politician and 16th president of the United States"
	},
	{
		x: 2,
		y: 0,
		answer: "ARLEN",
		direction: "down",
		clue: "\"Green Hat\" author",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Michael Arlen",
		wiki: "https://en.wikipedia.org/wiki/Michael_Arlen",
		description: "Armenian writer"
	},
	{
		x: 3,
		y: 0,
		answer: "BEA",
		direction: "down",
		clue: "Actress Arthur",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Bea Arthur",
		wiki: "https://en.wikipedia.org/wiki/Bea_Arthur",
		description: "American actress, singer, and comedian"
	},
	{
		x: 4,
		y: 0,
		answer: "EDNA",
		direction: "down",
		clue: "Millay",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Edna St. Vincent Millay",
		wiki: "https://en.wikipedia.org/wiki/Edna_St._Vincent_Millay",
		description: "American poet"
	},
	{
		x: 0,
		y: 1,
		answer: "FALK",
		direction: "down",
		clue: "Stage and film actor",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Peter Falk",
		wiki: "https://en.wikipedia.org/wiki/Peter_Falk",
		description: "American actor"
	},
	{
		x: 2,
		y: 1,
		answer: "RED",
		direction: "across",
		clue: "Mr. Buttons",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Red Buttons",
		wiki: "https://en.wikipedia.org/wiki/Red_Buttons",
		description: "American comedian and actor"
	},
	{
		x: 0,
		y: 2,
		answer: "ALLAN",
		direction: "across",
		clue: "Poe tale, with \"The\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Edgar Allan Poe",
		wiki: "https://en.wikipedia.org/wiki/Edgar_Allan_Poe",
		description: "19th-century American author, poet, editor and literary critic"
	},
	{
		x: 1,
		y: 2,
		answer: "LEO",
		direction: "down",
		clue: "Durocher",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Leo Durocher",
		wiki: "https://en.wikipedia.org/wiki/Leo_Durocher",
		description: "American baseball player and manager"
	},
	{
		x: 0,
		y: 3,
		answer: "LEE",
		direction: "across",
		clue: "Trevino",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "man",
		name: "Lee Trevino",
		wiki: "https://en.wikipedia.org/wiki/Lee_Trevino",
		description: "American golfer"
	},
	{
		x: 0,
		y: 4,
		answer: "KON",
		direction: "across",
		clue: "___-Tiki (Heyerdahl boat)",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Thor Heyerdahl",
		wiki: "https://en.wikipedia.org/wiki/Thor_Heyerdahl",
		description: "Norwegian anthropologist and adventurer (1914–2002)"
	}
];

var nyt1980s = [
	{
		x: 1,
		y: 0,
		answer: "ROMA",
		direction: "across",
		clue: "Caesar's urbs",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Julius Caesar",
		wiki: "https://en.wikipedia.org/wiki/Julius_Caesar",
		description: "Roman general and dictator"
	},
	{
		x: 2,
		y: 0,
		answer: "OSLER",
		direction: "down",
		clue: "Canadian physician",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "William Osler",
		wiki: "https://en.wikipedia.org/wiki/William_Osler",
		description: "Canadian physician and co-founder of Johns Hopkins Hospital"
	},
	{
		x: 3,
		y: 0,
		answer: "MET",
		direction: "down",
		clue: "Showcase for a Pavarotti",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Luciano Pavarotti",
		wiki: "https://en.wikipedia.org/wiki/Luciano_Pavarotti",
		description: "Italian operatic tenor"
	},
	{
		x: 4,
		y: 0,
		answer: "ANA",
		direction: "down",
		clue: "Actress Alicia",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "woman",
		name: "Ana Alicia",
		wiki: "https://en.wikipedia.org/wiki/Ana_Alicia",
		description: "American actress"
	},
	{
		x: 2,
		y: 1,
		answer: "SEN",
		direction: "across",
		clue: "J.F.K.: 1953-61",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "John F. Kennedy",
		wiki: "https://en.wikipedia.org/wiki/John_F._Kennedy",
		description: "35th president of the United States"
	},
	{
		x: 0,
		y: 2,
		answer: "DELTA",
		direction: "across",
		clue: "Welty's \"___ Wedding\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Eudora Welty",
		wiki: "https://en.wikipedia.org/wiki/Eudora_Welty",
		description: "American short story writer, novelist and photographer"
	},
	{
		x: 0,
		y: 2,
		answer: "DON",
		direction: "down",
		clue: "Don Sutton is one",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Don Sutton",
		wiki: "https://en.wikipedia.org/wiki/Don_Sutton",
		description: "American baseball player"
	},
	{
		x: 1,
		y: 2,
		answer: "EDE",
		direction: "down",
		clue: "Basil ___, noted painter of birds",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Basil Ede",
		wiki: "https://en.wikipedia.org/wiki/Basil_Ede",
		description: "English artist (1931-2016)"
	},
	{
		x: 0,
		y: 3,
		answer: "ODE",
		direction: "across",
		clue: "Pindar product",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Pindar",
		wiki: "https://en.wikipedia.org/wiki/Pindar",
		description: "Ancient Greek lyric poet from Thebes"
	},
	{
		x: 0,
		y: 4,
		answer: "NERI",
		direction: "across",
		clue: "St. Philip ___",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Philip Neri",
		wiki: "https://en.wikipedia.org/wiki/Philip_Neri",
		description: "Italian Roman Catholic saint"
	}
];

var nyt1990s = [
	{
		x: 1,
		y: 0,
		answer: "EGAN",
		direction: "across",
		clue: "Richard ___, actor from San Francisco",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Richard Egan",
		wiki: "https://en.wikipedia.org/wiki/Richard_Egan_(actor)",
		description: "American actor (1921-1987)"
	},
	{
		x: 2,
		y: 0,
		answer: "GILDA",
		direction: "down",
		clue: "Hayworth title role",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "woman",
		name: "Rita Hayworth",
		wiki: "https://en.wikipedia.org/wiki/Rita_Hayworth",
		description: "American actress, dancer and director (1918-1987)"
	},
	{
		x: 3,
		y: 0,
		answer: "ARI",
		direction: "down",
		clue: "Jackie's second spouse",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Aristotle Onassis",
		wiki: "https://en.wikipedia.org/wiki/Aristotle_Onassis",
		description: "Greek shipping magnate"
	},
	{
		x: 4,
		y: 0,
		answer: "NAN",
		direction: "down",
		clue: "Photographer Goldin",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Nan Goldin",
		wiki: "https://en.wikipedia.org/wiki/Nan_Goldin",
		description: "American photographer"
	},
	{
		x: 2,
		y: 1,
		answer: "IRA",
		direction: "across",
		clue: "Novelist Levin",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ira Levin",
		wiki: "https://en.wikipedia.org/wiki/Ira_Levin",
		description: "Novelist, playwright"
	},
	{
		x: 0,
		y: 2,
		answer: "DOLIN",
		direction: "across",
		clue: "Dancer Dolin",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Anton Dolin",
		wiki: "https://en.wikipedia.org/wiki/Anton_Dolin",
		description: "ballet dancer and choreographer (1904-1983)"
	},
	{
		x: 0,
		y: 2,
		answer: "DEL",
		direction: "down",
		clue: "Sci-fi author Lester ___ Rey",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Lester del Rey",
		wiki: "https://en.wikipedia.org/wiki/Lester_del_Rey",
		description: "Novelist, short story writer, editor"
	},
	{
		x: 1,
		y: 2,
		answer: "ODE",
		direction: "down",
		clue: "Wordsworth work",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "William Wordsworth",
		wiki: "https://en.wikipedia.org/wiki/William_Wordsworth",
		description: "English Romantic poet"
	},
	{
		x: 0,
		y: 3,
		answer: "EDD",
		direction: "across",
		clue: "Actor Byrnes",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Edd Byrnes",
		wiki: "https://en.wikipedia.org/wiki/Edd_Byrnes",
		description: "American actor"
	},
	{
		x: 0,
		y: 4,
		answer: "LEAR",
		direction: "across",
		clue: "The man behind Bunker",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Norman Lear",
		wiki: "https://en.wikipedia.org/wiki/Norman_Lear",
		description: "American television writer and producer"
	}
];

var nyt2000s = [
	{
		x: 1,
		y: 0,
		answer: "MORT",
		direction: "across",
		clue: "Cartoonist Walker",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Mort Walker",
		wiki: "https://en.wikipedia.org/wiki/Mort_Walker",
		description: "American comic strip cartoonist"
	},
	{
		x: 2,
		y: 0,
		answer: "OSHEA",
		direction: "down",
		clue: "Actor Milo",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Milo O'Shea",
		wiki: "https://en.wikipedia.org/wiki/Milo_O%27Shea",
		description: "Irish American actor (1926-2013)"
	},
	{
		x: 3,
		y: 0,
		answer: "REA",
		direction: "down",
		clue: "Peggy of \"The Dukes of Hazzard\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Peggy Rea",
		wiki: "https://en.wikipedia.org/wiki/Peggy_Rea",
		description: "actress (1921-2011)"
	},
	{
		x: 4,
		y: 0,
		answer: "TONI",
		direction: "down",
		clue: "Three-time skiing gold medalist ___ Sailer",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Toni Sailer",
		wiki: "https://en.wikipedia.org/wiki/Toni_Sailer",
		description: "Austrian alpine skier and actor"
	},
	{
		x: 0,
		y: 1,
		answer: "DEMI",
		direction: "down",
		clue: "Actress Moore",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Demi Moore",
		wiki: "https://en.wikipedia.org/wiki/Demi_Moore",
		description: "American actress"
	},
	{
		x: 2,
		y: 1,
		answer: "SEO",
		direction: "across",
		clue: "Former major-league pitcher ___ Seo",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "man",
		name: "Jae Weong Seo",
		wiki: "https://en.wikipedia.org/wiki/Jae_Weong_Seo",
		description: "South Korean baseball player"
	},
	{
		x: 0,
		y: 2,
		answer: "ETHAN",
		direction: "across",
		clue: "Hawke of Hollywood",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ethan Hawke",
		wiki: "https://en.wikipedia.org/wiki/Ethan_Hawke",
		description: "American actor and writer"
	},
	{
		x: 1,
		y: 2,
		answer: "TOM",
		direction: "down",
		clue: "Hero of several Clancy novels",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Tom Clancy",
		wiki: "https://en.wikipedia.org/wiki/Tom_Clancy",
		description: "American author"
	},
	{
		x: 0,
		y: 3,
		answer: "MOE",
		direction: "across",
		clue: "Stooge name",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Moe Howard",
		wiki: "https://en.wikipedia.org/wiki/Moe_Howard",
		description: "American actor and comedian"
	},
	{
		x: 0,
		y: 4,
		answer: "IMAN",
		direction: "across",
		clue: "Mogadishu-born model",
		race: "urm",
		binaryRace: "poc",
		hispanic: "FALSE",
		gender: "woman",
		name: "Iman",
		wiki: "https://en.wikipedia.org/wiki/Iman_(model)",
		description: "Somali supermodel and entrepreneur"
	}
];

var nyt2010s = [
	{
		x: 0,
		y: 0,
		answer: "SEGAR",
		direction: "across",
		clue: "Popeye creator E. C. ___",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "E. C. Segar",
		wiki: "https://en.wikipedia.org/wiki/E._C._Segar",
		description: "American cartoonist"
	},
	{
		x: 2,
		y: 0,
		answer: "GILDA",
		direction: "down",
		clue: "Baba ___ (Gilda Radner character)",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "woman",
		name: "Gilda Radner",
		wiki: "https://en.wikipedia.org/wiki/Gilda_Radner",
		description: "American comedian and actress"
	},
	{
		x: 3,
		y: 0,
		answer: "AVE",
		direction: "down",
		clue: "Caesar's greeting",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Julius Caesar",
		wiki: "https://en.wikipedia.org/wiki/Julius_Caesar",
		description: "Roman general and dictator"
	},
	{
		x: 4,
		y: 0,
		answer: "RON",
		direction: "down",
		clue: "Presidential son Reagan",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ron Reagan",
		wiki: "https://en.wikipedia.org/wiki/Ron_Reagan",
		description: "talk radio host and political analyst"
	},
	{
		x: 2,
		y: 1,
		answer: "IVO",
		direction: "across",
		clue: "Pianist Pogorelich",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ivo Pogorelić",
		wiki: "https://en.wikipedia.org/wiki/Ivo_Pogoreli%C4%87",
		description: "Croatian pianist"
	},
	{
		x: 0,
		y: 2,
		answer: "ARLEN",
		direction: "across",
		clue: "Specter of the Senate, once",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Arlen Specter",
		wiki: "https://en.wikipedia.org/wiki/Arlen_Specter",
		description: "American politician; former United States Senator from Pennsylvania (1930-2012)"
	},
	{
		x: 0,
		y: 2,
		answer: "ANA",
		direction: "down",
		clue: "Ortiz of \"Devious Maids\"",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "woman",
		name: "Ana Ortiz",
		wiki: "https://en.wikipedia.org/wiki/Ana_Ortiz",
		description: "actress"
	},
	{
		x: 1,
		y: 2,
		answer: "REN",
		direction: "down",
		clue: "Kylo ___, Adam Driver's role in \"Star Wars\"",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Adam Driver",
		wiki: "https://en.wikipedia.org/wiki/Adam_Driver",
		description: "American actor"
	},
	{
		x: 0,
		y: 3,
		answer: "NED",
		direction: "across",
		clue: "\"Our Town\" opera composer",
		race: "white",
		binaryRace: "white",
		hispanic: "FALSE",
		gender: "man",
		name: "Ned Rorem",
		wiki: "https://en.wikipedia.org/wiki/Ned_Rorem",
		description: "American composer (b1923)"
	},
	{
		x: 0,
		y: 4,
		answer: "ANAIS",
		direction: "across",
		clue: "Who wrote \"We do not see things as they are, we see them as we are\"",
		race: "urm",
		binaryRace: "white",
		hispanic: "TRUE",
		gender: "woman",
		name: "Anaïs Nin",
		wiki: "https://en.wikipedia.org/wiki/Ana%C3%AFs_Nin",
		description: "writer of novels, short stories."
	}
];

/* src/components/App.svelte generated by Svelte v3.29.4 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	const puzzlesToday = [
		{
			id: "usa2020",
			value: "USA Today",
			data: usa2020
		},
		{
			id: "up2020",
			value: "Universal",
			data: up2020
		},
		{
			id: "nyt2020",
			value: "New York Times",
			data: nyt2020
		},
		{
			id: "lat2020",
			value: "LA Times",
			data: lat2020
		},
		{
			id: "wsj2020",
			value: "Wall Street Journal",
			data: wsj2020
		}
	];

	const puzzlesNYT = [
		{
			id: "nyt1940s",
			value: "1940s",
			data: nyt1940s
		},
		{
			id: "nyt1950s",
			value: "1950s",
			data: nyt1950s
		},
		{
			id: "nyt1960s",
			value: "1960s",
			data: nyt1960s
		},
		{
			id: "nyt1970s",
			value: "1970s",
			data: nyt1970s
		},
		{
			id: "nyt1980s",
			value: "1980s",
			data: nyt1980s
		},
		{
			id: "nyt1990s",
			value: "1990s",
			data: nyt1990s
		},
		{
			id: "nyt2000s",
			value: "2000s",
			data: nyt2000s
		},
		{
			id: "nyt2010s",
			value: "2010s",
			data: nyt2010s
		}
	];

	return `${validate_component(Intro, "Intro").$$render($$result, {}, {}, {})}

<article>${validate_component(Play, "Play").$$render(
		$$result,
		{
			puzzles: puzzlesToday,
			title: "Publications in 2020"
		},
		{},
		{}
	)}
  ${validate_component(Play, "Play").$$render(
		$$result,
		{
			puzzles: puzzlesNYT,
			title: "New York Times by decade"
		},
		{},
		{}
	)}
</article>`;
});

module.exports = App;
