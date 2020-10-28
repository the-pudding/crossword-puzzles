
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-crossword/src/Toolbar.svelte generated by Svelte v3.29.4 */
    const file = "node_modules/svelte-crossword/src/Toolbar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:33) 
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reveal";
    			attr_dev(button, "class", "svelte-1d4ytnk");
    			add_location(button, file, 12, 6, 352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(12:33) ",
    		ctx
    	});

    	return block;
    }

    // (10:4) {#if action == 'clear'}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Clear";
    			attr_dev(button, "class", "svelte-1d4ytnk");
    			add_location(button, file, 10, 6, 243);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:4) {#if action == 'clear'}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#each actions as action}
    function create_each_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*action*/ ctx[4] == "clear") return create_if_block;
    		if (/*action*/ ctx[4] == "reveal") return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) {
    				if_block.d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(9:2) {#each actions as action}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let each_value = /*actions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "toolbar svelte-1d4ytnk");
    			add_location(div, file, 7, 0, 159);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, actions*/ 3) {
    				each_value = /*actions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Toolbar", slots, []);
    	const dispatch = createEventDispatcher();
    	let { actions = ["clear", "reveal"] } = $$props;
    	const writable_props = ["actions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Toolbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("event", "clear");
    	const click_handler_1 = () => dispatch("event", "reveal");

    	$$self.$$set = $$props => {
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    	};

    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch, actions });

    	$$self.$inject_state = $$props => {
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [actions, dispatch, click_handler, click_handler_1];
    }

    class Toolbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { actions: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toolbar",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get actions() {
    		throw new Error("<Toolbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<Toolbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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
    const file$1 = "node_modules/svelte-keyboard/src/Keyboard.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i].value;
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (68:10) {:else}
    function create_else_block(ctx) {
    	let t_value = /*value*/ ctx[14] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rowData*/ 1 && t_value !== (t_value = /*value*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(68:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:10) {#if swaps[value]}
    function create_if_block$1(ctx) {
    	let html_tag;
    	let raw_value = /*swaps*/ ctx[3][/*value*/ ctx[14]] + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rowData*/ 1 && raw_value !== (raw_value = /*swaps*/ ctx[3][/*value*/ ctx[14]] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(66:10) {#if swaps[value]}",
    		ctx
    	});

    	return block;
    }

    // (60:6) {#each keys as { value }}
    function create_each_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*swaps*/ ctx[3][/*value*/ ctx[14]]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[5](/*value*/ ctx[14], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[6](/*value*/ ctx[14], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();

    			set_style(button, "width", /*value*/ ctx[14].length === 1
    			? /*percentWidth*/ ctx[1]
    			: "auto");

    			attr_dev(button, "class", "svelte-1bx8glz");
    			toggle_class(button, "single", /*value*/ ctx[14].length === 1);
    			add_location(button, file$1, 60, 8, 1540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "touchstart", touchstart_handler, { passive: true }, false, false),
    					listen_dev(button, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}

    			if (dirty & /*rowData, percentWidth*/ 3) {
    				set_style(button, "width", /*value*/ ctx[14].length === 1
    				? /*percentWidth*/ ctx[1]
    				: "auto");
    			}

    			if (dirty & /*rowData*/ 1) {
    				toggle_class(button, "single", /*value*/ ctx[14].length === 1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(60:6) {#each keys as { value }}",
    		ctx
    	});

    	return block;
    }

    // (58:2) {#each rowData as keys}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*keys*/ ctx[11];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row svelte-1bx8glz");
    			add_location(div, file$1, 58, 4, 1482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rowData, percentWidth, dispatch, swaps*/ 15) {
    				each_value_1 = /*keys*/ ctx[11];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(58:2) {#each rowData as keys}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*rowData*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "keyboard");
    			add_location(div, file$1, 56, 0, 1429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rowData, percentWidth, dispatch, swaps*/ 15) {
    				each_value = /*rowData*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Keyboard", slots, []);
    	const dispatch = createEventDispatcher();
    	let { data = keyboardData } = $$props;
    	const unique = arr => [...new Set(arr)];
    	const rows = unique(data.map(d => d.row));
    	rows.sort((a, b) => a - b);

    	const swaps = {
    		delete: "<svg width=\"1em\" height=\"1em\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-delete\"><path d=\"M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z\"></path><line x1=\"18\" y1=\"9\" x2=\"12\" y2=\"15\"></line><line x1=\"12\" y1=\"9\" x2=\"18\" y2=\"15\"></line></svg>"
    	};

    	function onKey() {
    		const value = this.innerText;
    		dispatch("keydown", value);
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const touchstart_handler = value => dispatch("keydown", value);
    	const click_handler = value => dispatch("keydown", value);

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		keyboardData,
    		dispatch,
    		data,
    		unique,
    		rows,
    		swaps,
    		onKey,
    		rowData,
    		maxInRow,
    		percentWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    		if ("rowData" in $$props) $$invalidate(0, rowData = $$props.rowData);
    		if ("maxInRow" in $$props) $$invalidate(7, maxInRow = $$props.maxInRow);
    		if ("percentWidth" in $$props) $$invalidate(1, percentWidth = $$props.percentWidth);
    	};

    	let rowData;
    	let maxInRow;
    	let percentWidth;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 16) {
    			 $$invalidate(0, rowData = rows.map(r => data.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty & /*rowData*/ 1) {
    			 $$invalidate(7, maxInRow = Math.max(...rowData.map(r => r.length)));
    		}

    		if ($$self.$$.dirty & /*maxInRow*/ 128) {
    			 $$invalidate(1, percentWidth = `${1 / maxInRow * 100}%`);
    		}
    	};

    	return [
    		rowData,
    		percentWidth,
    		dispatch,
    		swaps,
    		data,
    		touchstart_handler,
    		click_handler
    	];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get data() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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

    const file$2 = "node_modules/svelte-crossword/src/Cell.svelte";

    // (104:2) {#if value}
    function create_if_block$2(ctx) {
    	let text_1;
    	let t;
    	let text_1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(/*value*/ ctx[2]);
    			attr_dev(text_1, "class", "value svelte-1fqxzxj");
    			attr_dev(text_1, "x", "0.5");
    			attr_dev(text_1, "y", "0.9");
    			attr_dev(text_1, "dominant-baseline", "auto");
    			attr_dev(text_1, "text-anchor", "middle");
    			add_location(text_1, file$2, 104, 4, 2278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (!current || dirty & /*value*/ 4) set_data_dev(t, /*value*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    					text_1,
    					pop,
    					{
    						y: 5,
    						delay: /*changeDelay*/ ctx[5],
    						duration: /*isRevealing*/ ctx[6] ? 250 : 0
    					},
    					true
    				);

    				text_1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!text_1_transition) text_1_transition = create_bidirectional_transition(
    				text_1,
    				pop,
    				{
    					y: 5,
    					delay: /*changeDelay*/ ctx[5],
    					duration: /*isRevealing*/ ctx[6] ? 250 : 0
    				},
    				false
    			);

    			text_1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    			if (detaching && text_1_transition) text_1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(104:2) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let g;
    	let rect;
    	let text_1;
    	let t;
    	let g_class_value;
    	let g_transform_value;
    	let g_id_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*value*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			rect = svg_element("rect");
    			if (if_block) if_block.c();
    			text_1 = svg_element("text");
    			t = text(/*number*/ ctx[3]);
    			attr_dev(rect, "width", "1");
    			attr_dev(rect, "height", "1");
    			attr_dev(rect, "class", "svelte-1fqxzxj");
    			add_location(rect, file$2, 102, 2, 2225);
    			attr_dev(text_1, "class", "number svelte-1fqxzxj");
    			attr_dev(text_1, "x", "0.1");
    			attr_dev(text_1, "y", "0.1");
    			attr_dev(text_1, "dominant-baseline", "hanging");
    			attr_dev(text_1, "text-anchor", "start");
    			add_location(text_1, file$2, 114, 2, 2514);
    			attr_dev(g, "class", g_class_value = "cell " + /*custom*/ ctx[4] + " svelte-1fqxzxj");
    			attr_dev(g, "transform", g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`);
    			attr_dev(g, "id", g_id_value = "cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1]);
    			attr_dev(g, "tabindex", "0");
    			toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    			add_location(g, file$2, 92, 0, 1957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			append_dev(g, rect);
    			if (if_block) if_block.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    			/*g_binding*/ ctx[19](g);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(g, "click", /*onClick*/ ctx[11], false, false, false),
    					listen_dev(g, "keydown", /*onKeydown*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*value*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(g, text_1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*number*/ 8) set_data_dev(t, /*number*/ ctx[3]);

    			if (!current || dirty & /*custom*/ 16 && g_class_value !== (g_class_value = "cell " + /*custom*/ ctx[4] + " svelte-1fqxzxj")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (!current || dirty & /*x, y*/ 3 && g_transform_value !== (g_transform_value = `translate(${/*x*/ ctx[0]}, ${/*y*/ ctx[1]})`)) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*x, y*/ 3 && g_id_value !== (g_id_value = "cell-" + /*x*/ ctx[0] + "-" + /*y*/ ctx[1])) {
    				attr_dev(g, "id", g_id_value);
    			}

    			if (dirty & /*custom, isFocused*/ 144) {
    				toggle_class(g, "is-focused", /*isFocused*/ ctx[7]);
    			}

    			if (dirty & /*custom, isSecondarilyFocused*/ 272) {
    				toggle_class(g, "is-secondarily-focused", /*isSecondarilyFocused*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block) if_block.d();
    			/*g_binding*/ ctx[19](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function pop(node, { delay = 0, duration = 250 }) {
    	return {
    		delay,
    		duration,
    		css: t => [`transform: translate(0, ${1 - t}px)`].join(";"), //
    		
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Cell", slots, []);
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

    	function onFocusSelf() {
    		if (!element) return;
    		if (isFocused) element.focus();
    	}

    	function onKeydown(e) {
    		if (e.ctrlKey && e.key.toLowerCase() == "z") {
    			onHistoricalChange(e.shiftKey ? 1 : -1);
    		}

    		if (e.ctrlKey) return;
    		if (e.altKey) return;

    		if (e.key === "Tab") {
    			onFocusClueDiff(e.shiftKey ? -1 : 1);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (e.key == " ") {
    			onFlipDirection();
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}

    		if (["Delete", "Backspace"].includes(e.key)) {
    			onCellUpdate(index, "", -1);
    			return;
    		}

    		const isKeyInAlphabet = (/^[a-zA-Z()]$/).test(e.key);

    		if (isKeyInAlphabet) {
    			onCellUpdate(index, e.key.toUpperCase());
    			return;
    		}

    		const diff = ({
    			ArrowLeft: ["across", -1],
    			ArrowRight: ["across", 1],
    			ArrowUp: ["down", -1],
    			ArrowDown: ["down", 1]
    		})[e.key];

    		if (diff) {
    			onMoveFocus(...diff);
    			e.preventDefault();
    			e.stopPropagation();
    			return;
    		}
    	}

    	function onClick() {
    		onFocusCell(index);
    	}

    	const writable_props = [
    		"x",
    		"y",
    		"value",
    		"number",
    		"index",
    		"custom",
    		"changeDelay",
    		"isRevealing",
    		"isFocused",
    		"isSecondarilyFocused",
    		"onFocusCell",
    		"onCellUpdate",
    		"onFocusClueDiff",
    		"onMoveFocus",
    		"onFlipDirection",
    		"onHistoricalChange"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	function g_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("number" in $$props) $$invalidate(3, number = $$props.number);
    		if ("index" in $$props) $$invalidate(12, index = $$props.index);
    		if ("custom" in $$props) $$invalidate(4, custom = $$props.custom);
    		if ("changeDelay" in $$props) $$invalidate(5, changeDelay = $$props.changeDelay);
    		if ("isRevealing" in $$props) $$invalidate(6, isRevealing = $$props.isRevealing);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    		if ("isSecondarilyFocused" in $$props) $$invalidate(8, isSecondarilyFocused = $$props.isSecondarilyFocused);
    		if ("onFocusCell" in $$props) $$invalidate(13, onFocusCell = $$props.onFocusCell);
    		if ("onCellUpdate" in $$props) $$invalidate(14, onCellUpdate = $$props.onCellUpdate);
    		if ("onFocusClueDiff" in $$props) $$invalidate(15, onFocusClueDiff = $$props.onFocusClueDiff);
    		if ("onMoveFocus" in $$props) $$invalidate(16, onMoveFocus = $$props.onMoveFocus);
    		if ("onFlipDirection" in $$props) $$invalidate(17, onFlipDirection = $$props.onFlipDirection);
    		if ("onHistoricalChange" in $$props) $$invalidate(18, onHistoricalChange = $$props.onHistoricalChange);
    	};

    	$$self.$capture_state = () => ({
    		x,
    		y,
    		value,
    		number,
    		index,
    		custom,
    		changeDelay,
    		isRevealing,
    		isFocused,
    		isSecondarilyFocused,
    		onFocusCell,
    		onCellUpdate,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onHistoricalChange,
    		element,
    		onFocusSelf,
    		onKeydown,
    		onClick,
    		pop
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("number" in $$props) $$invalidate(3, number = $$props.number);
    		if ("index" in $$props) $$invalidate(12, index = $$props.index);
    		if ("custom" in $$props) $$invalidate(4, custom = $$props.custom);
    		if ("changeDelay" in $$props) $$invalidate(5, changeDelay = $$props.changeDelay);
    		if ("isRevealing" in $$props) $$invalidate(6, isRevealing = $$props.isRevealing);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    		if ("isSecondarilyFocused" in $$props) $$invalidate(8, isSecondarilyFocused = $$props.isSecondarilyFocused);
    		if ("onFocusCell" in $$props) $$invalidate(13, onFocusCell = $$props.onFocusCell);
    		if ("onCellUpdate" in $$props) $$invalidate(14, onCellUpdate = $$props.onCellUpdate);
    		if ("onFocusClueDiff" in $$props) $$invalidate(15, onFocusClueDiff = $$props.onFocusClueDiff);
    		if ("onMoveFocus" in $$props) $$invalidate(16, onMoveFocus = $$props.onMoveFocus);
    		if ("onFlipDirection" in $$props) $$invalidate(17, onFlipDirection = $$props.onFlipDirection);
    		if ("onHistoricalChange" in $$props) $$invalidate(18, onHistoricalChange = $$props.onHistoricalChange);
    		if ("element" in $$props) $$invalidate(9, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isFocused*/ 128) {
    			 (onFocusSelf());
    		}
    	};

    	return [
    		x,
    		y,
    		value,
    		number,
    		custom,
    		changeDelay,
    		isRevealing,
    		isFocused,
    		isSecondarilyFocused,
    		element,
    		onKeydown,
    		onClick,
    		index,
    		onFocusCell,
    		onCellUpdate,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onHistoricalChange,
    		g_binding
    	];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			x: 0,
    			y: 1,
    			value: 2,
    			number: 3,
    			index: 12,
    			custom: 4,
    			changeDelay: 5,
    			isRevealing: 6,
    			isFocused: 7,
    			isSecondarilyFocused: 8,
    			onFocusCell: 13,
    			onCellUpdate: 14,
    			onFocusClueDiff: 15,
    			onMoveFocus: 16,
    			onFlipDirection: 17,
    			onHistoricalChange: 18
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !("x" in props)) {
    			console.warn("<Cell> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !("y" in props)) {
    			console.warn("<Cell> was created without expected prop 'y'");
    		}

    		if (/*value*/ ctx[2] === undefined && !("value" in props)) {
    			console.warn("<Cell> was created without expected prop 'value'");
    		}

    		if (/*number*/ ctx[3] === undefined && !("number" in props)) {
    			console.warn("<Cell> was created without expected prop 'number'");
    		}

    		if (/*index*/ ctx[12] === undefined && !("index" in props)) {
    			console.warn("<Cell> was created without expected prop 'index'");
    		}

    		if (/*custom*/ ctx[4] === undefined && !("custom" in props)) {
    			console.warn("<Cell> was created without expected prop 'custom'");
    		}
    	}

    	get x() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get number() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get changeDelay() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set changeDelay(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRevealing() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRevealing(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSecondarilyFocused() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSecondarilyFocused(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocusCell() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocusCell(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onCellUpdate() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onCellUpdate(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocusClueDiff() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocusClueDiff(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onMoveFocus() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onMoveFocus(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFlipDirection() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFlipDirection(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onHistoricalChange() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onHistoricalChange(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-crossword/src/Puzzle.svelte generated by Svelte v3.29.4 */
    const file$3 = "node_modules/svelte-crossword/src/Puzzle.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i].x;
    	child_ctx[30] = list[i].y;
    	child_ctx[31] = list[i].value;
    	child_ctx[32] = list[i].index;
    	child_ctx[33] = list[i].number;
    	child_ctx[34] = list[i].custom;
    	return child_ctx;
    }

    // (156:4) {#each cells as { x, y, value, index, number, custom }}
    function create_each_block$2(ctx) {
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				x: /*x*/ ctx[29],
    				y: /*y*/ ctx[30],
    				index: /*index*/ ctx[32],
    				value: /*value*/ ctx[31],
    				number: /*number*/ ctx[33],
    				custom: /*custom*/ ctx[34],
    				changeDelay: /*isRevealing*/ ctx[2]
    				? /*revealDuration*/ ctx[5] / /*cells*/ ctx[0].length * /*index*/ ctx[32]
    				: 0,
    				isRevealing: /*isRevealing*/ ctx[2],
    				isFocused: /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[32] && !/*isDisableHighlight*/ ctx[3],
    				isSecondarilyFocused: /*secondarilyFocusedCells*/ ctx[6].includes(/*index*/ ctx[32]) && !/*isDisableHighlight*/ ctx[3],
    				onFocusCell: /*onFocusCell*/ ctx[12],
    				onCellUpdate: /*onCellUpdate*/ ctx[10],
    				onFocusClueDiff: /*onFocusClueDiff*/ ctx[13],
    				onMoveFocus: /*onMoveFocus*/ ctx[14],
    				onFlipDirection: /*onFlipDirection*/ ctx[15],
    				onHistoricalChange: /*onHistoricalChange*/ ctx[11]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cell.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cell_changes = {};
    			if (dirty[0] & /*cells*/ 1) cell_changes.x = /*x*/ ctx[29];
    			if (dirty[0] & /*cells*/ 1) cell_changes.y = /*y*/ ctx[30];
    			if (dirty[0] & /*cells*/ 1) cell_changes.index = /*index*/ ctx[32];
    			if (dirty[0] & /*cells*/ 1) cell_changes.value = /*value*/ ctx[31];
    			if (dirty[0] & /*cells*/ 1) cell_changes.number = /*number*/ ctx[33];
    			if (dirty[0] & /*cells*/ 1) cell_changes.custom = /*custom*/ ctx[34];

    			if (dirty[0] & /*isRevealing, revealDuration, cells*/ 37) cell_changes.changeDelay = /*isRevealing*/ ctx[2]
    			? /*revealDuration*/ ctx[5] / /*cells*/ ctx[0].length * /*index*/ ctx[32]
    			: 0;

    			if (dirty[0] & /*isRevealing*/ 4) cell_changes.isRevealing = /*isRevealing*/ ctx[2];
    			if (dirty[0] & /*focusedCellIndex, cells, isDisableHighlight*/ 11) cell_changes.isFocused = /*focusedCellIndex*/ ctx[1] == /*index*/ ctx[32] && !/*isDisableHighlight*/ ctx[3];
    			if (dirty[0] & /*secondarilyFocusedCells, cells, isDisableHighlight*/ 73) cell_changes.isSecondarilyFocused = /*secondarilyFocusedCells*/ ctx[6].includes(/*index*/ ctx[32]) && !/*isDisableHighlight*/ ctx[3];
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(156:4) {#each cells as { x, y, value, index, number, custom }}",
    		ctx
    	});

    	return block;
    }

    // (178:1) {#if keyboardVisible}
    function create_if_block$3(ctx) {
    	let div;
    	let keyboard;
    	let current;
    	keyboard = new Keyboard({ $$inline: true });
    	keyboard.$on("keydown", /*onKeydown*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(keyboard.$$.fragment);
    			attr_dev(div, "class", "keyboard svelte-1yaebvb");
    			add_location(div, file$3, 178, 2, 5468);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(keyboard, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(keyboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(178:1) {#if keyboardVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let svg;
    	let svg_viewBox_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*cells*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*keyboardVisible*/ ctx[9] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = text("\n\n'");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*w*/ ctx[7] + " " + /*h*/ ctx[8]);
    			attr_dev(svg, "class", "svelte-1yaebvb");
    			add_location(svg, file$3, 154, 2, 4642);
    			attr_dev(section, "class", "puzzle svelte-1yaebvb");
    			toggle_class(section, "stacked", /*stacked*/ ctx[4]);
    			add_location(section, file$3, 153, 0, 4601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cells, isRevealing, revealDuration, focusedCellIndex, isDisableHighlight, secondarilyFocusedCells, onFocusCell, onCellUpdate, onFocusClueDiff, onMoveFocus, onFlipDirection, onHistoricalChange*/ 64623) {
    				each_value = /*cells*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*w, h*/ 384 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*w*/ ctx[7] + " " + /*h*/ ctx[8])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty[0] & /*stacked*/ 16) {
    				toggle_class(section, "stacked", /*stacked*/ ctx[4]);
    			}

    			if (/*keyboardVisible*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*keyboardVisible*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const numberOfStatesInHistory = 10;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Puzzle", slots, []);
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
    	let focusedCellIndexHistoryIndex = 0;
    	let focusedCellIndexHistory = [];
    	let secondarilyFocusedCells = [];
    	let isMobile = false;

    	onMount(() => {
    		$$invalidate(25, isMobile = checkMobile());
    	});

    	function updateSecondarilyFocusedCells() {
    		$$invalidate(6, secondarilyFocusedCells = getSecondarilyFocusedCells({ cells, focusedDirection, focusedCell }));
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
    		$$invalidate(0, cells = newCells);
    		onFocusCellDiff(diff, doReplaceFilledCells);
    	}

    	function onHistoricalChange(diff) {
    		cellsHistoryIndex += -diff;
    		$$invalidate(0, cells = cellsHistory[cellsHistoryIndex] || cells);
    		focusedCellIndexHistoryIndex += -diff;
    		$$invalidate(1, focusedCellIndex = focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex);
    	}

    	function onFocusCell(index) {
    		if (index == focusedCellIndex) {
    			onFlipDirection();
    		} else {
    			$$invalidate(1, focusedCellIndex = index);
    			focusedCellIndexHistory = [index, ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory)];
    			focusedCellIndexHistoryIndex = 0;
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

    		$$invalidate(1, focusedCellIndex = cells.findIndex(cell => cell.x == nextClue.x && cell.y == nextClue.y));
    	}

    	function onMoveFocus(direction, diff) {
    		if (focusedDirection != direction) {
    			$$invalidate(17, focusedDirection = direction);
    		} else {
    			const nextCell = getCellAfterDiff({ diff, cells, direction, focusedCell });
    			if (!nextCell) return;
    			onFocusCell(nextCell.index);
    		}
    	}

    	function onFlipDirection() {
    		const newDirection = focusedDirection === "across" ? "down" : "across";
    		const hasClueInNewDirection = !!focusedCell["clueNumbers"][newDirection];
    		if (hasClueInNewDirection) $$invalidate(17, focusedDirection = newDirection);
    	}

    	function onKeydown({ detail }) {
    		const diff = detail === "delete" ? -1 : 1;
    		const value = detail === "delete" ? "" : detail;
    		onCellUpdate(focusedCellIndex, value, diff);
    	}

    	const writable_props = [
    		"clues",
    		"cells",
    		"focusedDirection",
    		"focusedCellIndex",
    		"focusedCell",
    		"isRevealing",
    		"isDisableHighlight",
    		"stacked",
    		"revealDuration",
    		"showKeyboard"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Puzzle> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(18, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(0, cells = $$props.cells);
    		if ("focusedDirection" in $$props) $$invalidate(17, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(1, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(19, focusedCell = $$props.focusedCell);
    		if ("isRevealing" in $$props) $$invalidate(2, isRevealing = $$props.isRevealing);
    		if ("isDisableHighlight" in $$props) $$invalidate(3, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(4, stacked = $$props.stacked);
    		if ("revealDuration" in $$props) $$invalidate(5, revealDuration = $$props.revealDuration);
    		if ("showKeyboard" in $$props) $$invalidate(20, showKeyboard = $$props.showKeyboard);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Keyboard,
    		getSecondarilyFocusedCells,
    		getCellAfterDiff,
    		checkMobile,
    		Cell,
    		clues,
    		cells,
    		focusedDirection,
    		focusedCellIndex,
    		focusedCell,
    		isRevealing,
    		isDisableHighlight,
    		stacked,
    		revealDuration,
    		showKeyboard,
    		cellsHistoryIndex,
    		cellsHistory,
    		focusedCellIndexHistoryIndex,
    		focusedCellIndexHistory,
    		secondarilyFocusedCells,
    		isMobile,
    		numberOfStatesInHistory,
    		updateSecondarilyFocusedCells,
    		onCellUpdate,
    		onHistoricalChange,
    		onFocusCell,
    		onFocusCellDiff,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onKeydown,
    		w,
    		h,
    		keyboardVisible,
    		sortedCellsInDirection
    	});

    	$$self.$inject_state = $$props => {
    		if ("clues" in $$props) $$invalidate(18, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(0, cells = $$props.cells);
    		if ("focusedDirection" in $$props) $$invalidate(17, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(1, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(19, focusedCell = $$props.focusedCell);
    		if ("isRevealing" in $$props) $$invalidate(2, isRevealing = $$props.isRevealing);
    		if ("isDisableHighlight" in $$props) $$invalidate(3, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(4, stacked = $$props.stacked);
    		if ("revealDuration" in $$props) $$invalidate(5, revealDuration = $$props.revealDuration);
    		if ("showKeyboard" in $$props) $$invalidate(20, showKeyboard = $$props.showKeyboard);
    		if ("cellsHistoryIndex" in $$props) cellsHistoryIndex = $$props.cellsHistoryIndex;
    		if ("cellsHistory" in $$props) cellsHistory = $$props.cellsHistory;
    		if ("focusedCellIndexHistoryIndex" in $$props) focusedCellIndexHistoryIndex = $$props.focusedCellIndexHistoryIndex;
    		if ("focusedCellIndexHistory" in $$props) focusedCellIndexHistory = $$props.focusedCellIndexHistory;
    		if ("secondarilyFocusedCells" in $$props) $$invalidate(6, secondarilyFocusedCells = $$props.secondarilyFocusedCells);
    		if ("isMobile" in $$props) $$invalidate(25, isMobile = $$props.isMobile);
    		if ("w" in $$props) $$invalidate(7, w = $$props.w);
    		if ("h" in $$props) $$invalidate(8, h = $$props.h);
    		if ("keyboardVisible" in $$props) $$invalidate(9, keyboardVisible = $$props.keyboardVisible);
    		if ("sortedCellsInDirection" in $$props) sortedCellsInDirection = $$props.sortedCellsInDirection;
    	};

    	let w;
    	let h;
    	let keyboardVisible;
    	let sortedCellsInDirection;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*cells*/ 1) {
    			 $$invalidate(7, w = Math.max(...cells.map(d => d.x)) + 1);
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 1) {
    			 $$invalidate(8, h = Math.max(...cells.map(d => d.y)) + 1);
    		}

    		if ($$self.$$.dirty[0] & /*showKeyboard, isMobile*/ 34603008) {
    			 $$invalidate(9, keyboardVisible = typeof showKeyboard === "boolean"
    			? showKeyboard
    			: isMobile);
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex, focusedDirection*/ 131075) {
    			 (updateSecondarilyFocusedCells());
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedDirection*/ 131073) {
    			 sortedCellsInDirection = [...cells].sort((a, b) => focusedDirection == "down"
    			? a.x - b.x || a.y - b.y
    			: a.y - b.y || a.x - b.x);
    		}
    	};

    	return [
    		cells,
    		focusedCellIndex,
    		isRevealing,
    		isDisableHighlight,
    		stacked,
    		revealDuration,
    		secondarilyFocusedCells,
    		w,
    		h,
    		keyboardVisible,
    		onCellUpdate,
    		onHistoricalChange,
    		onFocusCell,
    		onFocusClueDiff,
    		onMoveFocus,
    		onFlipDirection,
    		onKeydown,
    		focusedDirection,
    		clues,
    		focusedCell,
    		showKeyboard
    	];
    }

    class Puzzle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				clues: 18,
    				cells: 0,
    				focusedDirection: 17,
    				focusedCellIndex: 1,
    				focusedCell: 19,
    				isRevealing: 2,
    				isDisableHighlight: 3,
    				stacked: 4,
    				revealDuration: 5,
    				showKeyboard: 20
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Puzzle",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*clues*/ ctx[18] === undefined && !("clues" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'clues'");
    		}

    		if (/*cells*/ ctx[0] === undefined && !("cells" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'cells'");
    		}

    		if (/*focusedDirection*/ ctx[17] === undefined && !("focusedDirection" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedDirection'");
    		}

    		if (/*focusedCellIndex*/ ctx[1] === undefined && !("focusedCellIndex" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedCellIndex'");
    		}

    		if (/*focusedCell*/ ctx[19] === undefined && !("focusedCell" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'focusedCell'");
    		}

    		if (/*isRevealing*/ ctx[2] === undefined && !("isRevealing" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isRevealing'");
    		}

    		if (/*isDisableHighlight*/ ctx[3] === undefined && !("isDisableHighlight" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'isDisableHighlight'");
    		}

    		if (/*stacked*/ ctx[4] === undefined && !("stacked" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'stacked'");
    		}

    		if (/*showKeyboard*/ ctx[20] === undefined && !("showKeyboard" in props)) {
    			console.warn("<Puzzle> was created without expected prop 'showKeyboard'");
    		}
    	}

    	get clues() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cells() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cells(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedDirection() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedDirection(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCellIndex() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCellIndex(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCell() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCell(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRevealing() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRevealing(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisableHighlight() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisableHighlight(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealDuration() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealDuration(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showKeyboard() {
    		throw new Error("<Puzzle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showKeyboard(value) {
    		throw new Error("<Puzzle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function scrollTO (node, isFocused) {
      return {
        update(newIsFocused) {
          isFocused = newIsFocused;
          if (!isFocused) return;
          const list = node.parentElement.parentElement;
          if (!list) return;

          const top = node.offsetTop;
          const currentYTop = list.scrollTop;
          const currentYBottom = currentYTop + list.clientHeight;
          const buffer = 50;
          if (top < currentYTop + buffer || top > currentYBottom - buffer) {
            list.scrollTo({ top: top, behavior: "smooth" });
          }
        },
      };
    }

    /* node_modules/svelte-crossword/src/Clue.svelte generated by Svelte v3.29.4 */
    const file$4 = "node_modules/svelte-crossword/src/Clue.svelte";

    function create_fragment$4(ctx) {
    	let li;
    	let button;
    	let t0;
    	let t1;
    	let t2;
    	let scrollTo_action;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text(/*number*/ ctx[0]);
    			t1 = text(".\n    ");
    			t2 = text(/*clue*/ ctx[1]);
    			attr_dev(button, "class", "clue svelte-1i661i1");
    			toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[3]);
    			toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[4]);
    			toggle_class(button, "is-filled", /*isFilled*/ ctx[2]);
    			add_location(button, file$4, 16, 2, 351);
    			add_location(li, file$4, 15, 0, 295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			/*li_binding*/ ctx[8](li);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*onFocus*/ ctx[5])) /*onFocus*/ ctx[5].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					action_destroyer(scrollTo_action = scrollTO.call(null, li, /*isFocused*/ ctx[7]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*number*/ 1) set_data_dev(t0, /*number*/ ctx[0]);
    			if (dirty & /*clue*/ 2) set_data_dev(t2, /*clue*/ ctx[1]);

    			if (dirty & /*isNumberFocused*/ 8) {
    				toggle_class(button, "is-number-focused", /*isNumberFocused*/ ctx[3]);
    			}

    			if (dirty & /*isDirectionFocused*/ 16) {
    				toggle_class(button, "is-direction-focused", /*isDirectionFocused*/ ctx[4]);
    			}

    			if (dirty & /*isFilled*/ 4) {
    				toggle_class(button, "is-filled", /*isFilled*/ ctx[2]);
    			}

    			if (scrollTo_action && is_function(scrollTo_action.update) && dirty & /*isFocused*/ 128) scrollTo_action.update.call(null, /*isFocused*/ ctx[7]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			/*li_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clue", slots, []);
    	let { number } = $$props;
    	let { clue } = $$props;
    	let { isFilled } = $$props;
    	let { isNumberFocused = false } = $$props;
    	let { isDirectionFocused = false } = $$props;

    	let { onFocus = () => {
    		
    	} } = $$props;

    	let element;

    	const writable_props = [
    		"number",
    		"clue",
    		"isFilled",
    		"isNumberFocused",
    		"isDirectionFocused",
    		"onFocus"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clue> was created with unknown prop '${key}'`);
    	});

    	function li_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(6, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("isFilled" in $$props) $$invalidate(2, isFilled = $$props.isFilled);
    		if ("isNumberFocused" in $$props) $$invalidate(3, isNumberFocused = $$props.isNumberFocused);
    		if ("isDirectionFocused" in $$props) $$invalidate(4, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onFocus" in $$props) $$invalidate(5, onFocus = $$props.onFocus);
    	};

    	$$self.$capture_state = () => ({
    		scrollTo: scrollTO,
    		number,
    		clue,
    		isFilled,
    		isNumberFocused,
    		isDirectionFocused,
    		onFocus,
    		element,
    		isFocused
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(0, number = $$props.number);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    		if ("isFilled" in $$props) $$invalidate(2, isFilled = $$props.isFilled);
    		if ("isNumberFocused" in $$props) $$invalidate(3, isNumberFocused = $$props.isNumberFocused);
    		if ("isDirectionFocused" in $$props) $$invalidate(4, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onFocus" in $$props) $$invalidate(5, onFocus = $$props.onFocus);
    		if ("element" in $$props) $$invalidate(6, element = $$props.element);
    		if ("isFocused" in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    	};

    	let isFocused;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isNumberFocused*/ 8) {
    			 $$invalidate(7, isFocused = isNumberFocused);
    		}
    	};

    	return [
    		number,
    		clue,
    		isFilled,
    		isNumberFocused,
    		isDirectionFocused,
    		onFocus,
    		element,
    		isFocused,
    		li_binding
    	];
    }

    class Clue extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			number: 0,
    			clue: 1,
    			isFilled: 2,
    			isNumberFocused: 3,
    			isDirectionFocused: 4,
    			onFocus: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clue",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*number*/ ctx[0] === undefined && !("number" in props)) {
    			console.warn("<Clue> was created without expected prop 'number'");
    		}

    		if (/*clue*/ ctx[1] === undefined && !("clue" in props)) {
    			console.warn("<Clue> was created without expected prop 'clue'");
    		}

    		if (/*isFilled*/ ctx[2] === undefined && !("isFilled" in props)) {
    			console.warn("<Clue> was created without expected prop 'isFilled'");
    		}
    	}

    	get number() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clue() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clue(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFilled() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFilled(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isNumberFocused() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNumberFocused(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDirectionFocused() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDirectionFocused(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocus() {
    		throw new Error("<Clue>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocus(value) {
    		throw new Error("<Clue>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-crossword/src/ClueList.svelte generated by Svelte v3.29.4 */
    const file$5 = "node_modules/svelte-crossword/src/ClueList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (14:4) {#each clues as clue}
    function create_each_block$3(ctx) {
    	let clue;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[5](/*clue*/ ctx[6], ...args);
    	}

    	clue = new Clue({
    			props: {
    				clue: /*clue*/ ctx[6].clue,
    				number: /*clue*/ ctx[6].number,
    				isFilled: /*clue*/ ctx[6].isFilled,
    				isNumberFocused: /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] === /*clue*/ ctx[6].number,
    				isDirectionFocused: /*isDirectionFocused*/ ctx[3],
    				onFocus: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(clue.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(clue, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const clue_changes = {};
    			if (dirty & /*clues*/ 2) clue_changes.clue = /*clue*/ ctx[6].clue;
    			if (dirty & /*clues*/ 2) clue_changes.number = /*clue*/ ctx[6].number;
    			if (dirty & /*clues*/ 2) clue_changes.isFilled = /*clue*/ ctx[6].isFilled;
    			if (dirty & /*focusedClueNumbers, direction, clues*/ 7) clue_changes.isNumberFocused = /*focusedClueNumbers*/ ctx[2][/*direction*/ ctx[0]] === /*clue*/ ctx[6].number;
    			if (dirty & /*isDirectionFocused*/ 8) clue_changes.isDirectionFocused = /*isDirectionFocused*/ ctx[3];
    			if (dirty & /*onClueFocus, clues*/ 18) clue_changes.onFocus = func;
    			clue.$set(clue_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clue.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clue.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clue, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(14:4) {#each clues as clue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let div;
    	let ul;
    	let current;
    	let each_value = /*clues*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(/*direction*/ ctx[0]);
    			t1 = space();
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "svelte-1k6v3oi");
    			add_location(p, file$5, 10, 0, 193);
    			attr_dev(ul, "class", "svelte-1k6v3oi");
    			add_location(ul, file$5, 12, 2, 233);
    			attr_dev(div, "class", "list svelte-1k6v3oi");
    			add_location(div, file$5, 11, 0, 212);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*direction*/ 1) set_data_dev(t0, /*direction*/ ctx[0]);

    			if (dirty & /*clues, focusedClueNumbers, direction, isDirectionFocused, onClueFocus*/ 31) {
    				each_value = /*clues*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClueList", slots, []);
    	let { direction } = $$props;
    	let { clues } = $$props;
    	let { focusedClueNumbers } = $$props;
    	let { isDirectionFocused } = $$props;
    	let { onClueFocus } = $$props;

    	const writable_props = [
    		"direction",
    		"clues",
    		"focusedClueNumbers",
    		"isDirectionFocused",
    		"onClueFocus"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClueList> was created with unknown prop '${key}'`);
    	});

    	const func = clue => onClueFocus(clue);

    	$$self.$$set = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("focusedClueNumbers" in $$props) $$invalidate(2, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("isDirectionFocused" in $$props) $$invalidate(3, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onClueFocus" in $$props) $$invalidate(4, onClueFocus = $$props.onClueFocus);
    	};

    	$$self.$capture_state = () => ({
    		Clue,
    		direction,
    		clues,
    		focusedClueNumbers,
    		isDirectionFocused,
    		onClueFocus
    	});

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("focusedClueNumbers" in $$props) $$invalidate(2, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("isDirectionFocused" in $$props) $$invalidate(3, isDirectionFocused = $$props.isDirectionFocused);
    		if ("onClueFocus" in $$props) $$invalidate(4, onClueFocus = $$props.onClueFocus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [direction, clues, focusedClueNumbers, isDirectionFocused, onClueFocus, func];
    }

    class ClueList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			direction: 0,
    			clues: 1,
    			focusedClueNumbers: 2,
    			isDirectionFocused: 3,
    			onClueFocus: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClueList",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*direction*/ ctx[0] === undefined && !("direction" in props)) {
    			console.warn("<ClueList> was created without expected prop 'direction'");
    		}

    		if (/*clues*/ ctx[1] === undefined && !("clues" in props)) {
    			console.warn("<ClueList> was created without expected prop 'clues'");
    		}

    		if (/*focusedClueNumbers*/ ctx[2] === undefined && !("focusedClueNumbers" in props)) {
    			console.warn("<ClueList> was created without expected prop 'focusedClueNumbers'");
    		}

    		if (/*isDirectionFocused*/ ctx[3] === undefined && !("isDirectionFocused" in props)) {
    			console.warn("<ClueList> was created without expected prop 'isDirectionFocused'");
    		}

    		if (/*onClueFocus*/ ctx[4] === undefined && !("onClueFocus" in props)) {
    			console.warn("<ClueList> was created without expected prop 'onClueFocus'");
    		}
    	}

    	get direction() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clues() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedClueNumbers() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedClueNumbers(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDirectionFocused() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDirectionFocused(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClueFocus() {
    		throw new Error("<ClueList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClueFocus(value) {
    		throw new Error("<ClueList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-crossword/src/ClueBar.svelte generated by Svelte v3.29.4 */
    const file$6 = "node_modules/svelte-crossword/src/ClueBar.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let button0;
    	let svg0;
    	let polyline0;
    	let t0;
    	let p;
    	let t1;
    	let t2;
    	let button1;
    	let svg1;
    	let polyline1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			polyline0 = svg_element("polyline");
    			t0 = space();
    			p = element("p");
    			t1 = text(/*clue*/ ctx[1]);
    			t2 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			polyline1 = svg_element("polyline");
    			attr_dev(polyline0, "points", "15 18 9 12 15 6");
    			add_location(polyline0, file$6, 19, 43, 507);
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "stroke", "currentColor");
    			attr_dev(svg0, "stroke-width", "2");
    			attr_dev(svg0, "stroke-linecap", "round");
    			attr_dev(svg0, "stroke-linejoin", "round");
    			attr_dev(svg0, "class", "feather feather-chevron-left");
    			add_location(svg0, file$6, 10, 4, 270);
    			attr_dev(button0, "class", "svelte-1k30qnz");
    			add_location(button0, file$6, 9, 2, 194);
    			attr_dev(p, "class", "svelte-1k30qnz");
    			add_location(p, file$6, 22, 2, 582);
    			attr_dev(polyline1, "points", "9 18 15 12 9 6");
    			add_location(polyline1, file$6, 33, 44, 912);
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "stroke", "currentColor");
    			attr_dev(svg1, "stroke-width", "2");
    			attr_dev(svg1, "stroke-linecap", "round");
    			attr_dev(svg1, "stroke-linejoin", "round");
    			attr_dev(svg1, "class", "feather feather-chevron-right");
    			add_location(svg1, file$6, 24, 4, 674);
    			attr_dev(button1, "class", "svelte-1k30qnz");
    			add_location(button1, file$6, 23, 2, 598);
    			attr_dev(div, "class", "bar svelte-1k30qnz");
    			add_location(div, file$6, 8, 0, 174);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, polyline0);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, polyline1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clue*/ 2) set_data_dev(t1, /*clue*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ClueBar", slots, []);
    	const dispatch = createEventDispatcher();
    	let { currentClue } = $$props;
    	const writable_props = ["currentClue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClueBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("nextClue", currentClue.index - 1);
    	const click_handler_1 = () => dispatch("nextClue", currentClue.index + 1);

    	$$self.$$set = $$props => {
    		if ("currentClue" in $$props) $$invalidate(0, currentClue = $$props.currentClue);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		currentClue,
    		clue
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentClue" in $$props) $$invalidate(0, currentClue = $$props.currentClue);
    		if ("clue" in $$props) $$invalidate(1, clue = $$props.clue);
    	};

    	let clue;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentClue*/ 1) {
    			 $$invalidate(1, clue = currentClue["clue"]);
    		}
    	};

    	return [currentClue, clue, dispatch, click_handler, click_handler_1];
    }

    class ClueBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { currentClue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClueBar",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentClue*/ ctx[0] === undefined && !("currentClue" in props)) {
    			console.warn("<ClueBar> was created without expected prop 'currentClue'");
    		}
    	}

    	get currentClue() {
    		throw new Error("<ClueBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentClue(value) {
    		throw new Error("<ClueBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-crossword/src/Clues.svelte generated by Svelte v3.29.4 */
    const file$7 = "node_modules/svelte-crossword/src/Clues.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (38:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let current;
    	let each_value = ["across", "down"];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 2; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "clues--list");
    			add_location(div, file$7, 38, 4, 1015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < 2; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*focusedClueNumbers, clues, focusedDirection, onClueFocus*/ 43) {
    				each_value = ["across", "down"];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < 2; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = 2; i < 2; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 2; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 2; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(38:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#if stacked}
    function create_if_block$4(ctx) {
    	let div;
    	let cluebar;
    	let current;

    	cluebar = new ClueBar({
    			props: { currentClue: /*currentClue*/ ctx[4] },
    			$$inline: true
    		});

    	cluebar.$on("nextClue", /*onNextClue*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(cluebar.$$.fragment);
    			attr_dev(div, "class", "clues--stacked svelte-16o7lzd");
    			add_location(div, file$7, 34, 4, 888);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(cluebar, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const cluebar_changes = {};
    			if (dirty & /*currentClue*/ 16) cluebar_changes.currentClue = /*currentClue*/ ctx[4];
    			cluebar.$set(cluebar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cluebar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cluebar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(cluebar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(34:2) {#if stacked}",
    		ctx
    	});

    	return block;
    }

    // (40:6) {#each ['across', 'down'] as direction}
    function create_each_block$4(ctx) {
    	let cluelist;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[10](/*direction*/ ctx[11], ...args);
    	}

    	cluelist = new ClueList({
    			props: {
    				direction: /*direction*/ ctx[11],
    				focusedClueNumbers: /*focusedClueNumbers*/ ctx[3],
    				clues: /*clues*/ ctx[1].filter(func),
    				isDirectionFocused: /*focusedDirection*/ ctx[0] === /*direction*/ ctx[11],
    				onClueFocus: /*onClueFocus*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cluelist.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cluelist, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cluelist_changes = {};
    			if (dirty & /*focusedClueNumbers*/ 8) cluelist_changes.focusedClueNumbers = /*focusedClueNumbers*/ ctx[3];
    			if (dirty & /*clues*/ 2) cluelist_changes.clues = /*clues*/ ctx[1].filter(func);
    			if (dirty & /*focusedDirection*/ 1) cluelist_changes.isDirectionFocused = /*focusedDirection*/ ctx[0] === /*direction*/ ctx[11];
    			cluelist.$set(cluelist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cluelist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cluelist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cluelist, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(40:6) {#each ['across', 'down'] as direction}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*stacked*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			attr_dev(section, "class", "clues svelte-16o7lzd");
    			toggle_class(section, "stacked", /*stacked*/ ctx[2]);
    			add_location(section, file$7, 32, 0, 830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_blocks[current_block_type_index].m(section, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(section, null);
    			}

    			if (dirty & /*stacked*/ 4) {
    				toggle_class(section, "stacked", /*stacked*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clues", slots, []);
    	let { clues } = $$props;
    	let { cellIndexMap } = $$props;
    	let { focusedDirection } = $$props;
    	let { focusedCellIndex } = $$props;
    	let { focusedCell } = $$props;
    	let { stacked } = $$props;

    	function onClueFocus({ direction, id }) {
    		$$invalidate(0, focusedDirection = direction);
    		$$invalidate(7, focusedCellIndex = cellIndexMap[id] || 0);
    	}

    	function onNextClue({ detail }) {
    		let next = detail;
    		if (next < 0) next = clues.length - 1; else if (next > clues.length - 1) next = 0;
    		const { direction, id } = clues[next];
    		onClueFocus({ direction, id });
    	}

    	const writable_props = [
    		"clues",
    		"cellIndexMap",
    		"focusedDirection",
    		"focusedCellIndex",
    		"focusedCell",
    		"stacked"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clues> was created with unknown prop '${key}'`);
    	});

    	const func = (direction, d) => d.direction === direction;

    	$$self.$$set = $$props => {
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("cellIndexMap" in $$props) $$invalidate(8, cellIndexMap = $$props.cellIndexMap);
    		if ("focusedDirection" in $$props) $$invalidate(0, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(7, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(9, focusedCell = $$props.focusedCell);
    		if ("stacked" in $$props) $$invalidate(2, stacked = $$props.stacked);
    	};

    	$$self.$capture_state = () => ({
    		ClueList,
    		ClueBar,
    		clues,
    		cellIndexMap,
    		focusedDirection,
    		focusedCellIndex,
    		focusedCell,
    		stacked,
    		onClueFocus,
    		onNextClue,
    		focusedClueNumbers,
    		currentClue
    	});

    	$$self.$inject_state = $$props => {
    		if ("clues" in $$props) $$invalidate(1, clues = $$props.clues);
    		if ("cellIndexMap" in $$props) $$invalidate(8, cellIndexMap = $$props.cellIndexMap);
    		if ("focusedDirection" in $$props) $$invalidate(0, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(7, focusedCellIndex = $$props.focusedCellIndex);
    		if ("focusedCell" in $$props) $$invalidate(9, focusedCell = $$props.focusedCell);
    		if ("stacked" in $$props) $$invalidate(2, stacked = $$props.stacked);
    		if ("focusedClueNumbers" in $$props) $$invalidate(3, focusedClueNumbers = $$props.focusedClueNumbers);
    		if ("currentClue" in $$props) $$invalidate(4, currentClue = $$props.currentClue);
    	};

    	let focusedClueNumbers;
    	let currentClue;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*focusedCell*/ 512) {
    			 $$invalidate(3, focusedClueNumbers = focusedCell.clueNumbers || {});
    		}

    		if ($$self.$$.dirty & /*clues, focusedDirection, focusedClueNumbers*/ 11) {
    			 $$invalidate(4, currentClue = clues.find(c => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]));
    		}
    	};

    	return [
    		focusedDirection,
    		clues,
    		stacked,
    		focusedClueNumbers,
    		currentClue,
    		onClueFocus,
    		onNextClue,
    		focusedCellIndex,
    		cellIndexMap,
    		focusedCell,
    		func
    	];
    }

    class Clues extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			clues: 1,
    			cellIndexMap: 8,
    			focusedDirection: 0,
    			focusedCellIndex: 7,
    			focusedCell: 9,
    			stacked: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clues",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*clues*/ ctx[1] === undefined && !("clues" in props)) {
    			console.warn("<Clues> was created without expected prop 'clues'");
    		}

    		if (/*cellIndexMap*/ ctx[8] === undefined && !("cellIndexMap" in props)) {
    			console.warn("<Clues> was created without expected prop 'cellIndexMap'");
    		}

    		if (/*focusedDirection*/ ctx[0] === undefined && !("focusedDirection" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedDirection'");
    		}

    		if (/*focusedCellIndex*/ ctx[7] === undefined && !("focusedCellIndex" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedCellIndex'");
    		}

    		if (/*focusedCell*/ ctx[9] === undefined && !("focusedCell" in props)) {
    			console.warn("<Clues> was created without expected prop 'focusedCell'");
    		}

    		if (/*stacked*/ ctx[2] === undefined && !("stacked" in props)) {
    			console.warn("<Clues> was created without expected prop 'stacked'");
    		}
    	}

    	get clues() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clues(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellIndexMap() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellIndexMap(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedDirection() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedDirection(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCellIndex() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCellIndex(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusedCell() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focusedCell(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stacked() {
    		throw new Error("<Clues>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stacked(value) {
    		throw new Error("<Clues>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function quadIn(t) {
        return t * t;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules/svelte-crossword/src/Confetti.svelte generated by Svelte v3.29.4 */
    const file$8 = "node_modules/svelte-crossword/src/Confetti.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[9] = list[i][1];
    	child_ctx[10] = list[i][2];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (45:2) {#each allElements as [element, color, scale], i}
    function create_each_block$5(ctx) {
    	let g1;
    	let g0;
    	let raw_value = /*element*/ ctx[8] + "";
    	let g0_fill_value;
    	let g0_style_value;

    	const block = {
    		c: function create() {
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			attr_dev(g0, "fill", g0_fill_value = /*color*/ ctx[9]);

    			attr_dev(g0, "style", g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"));

    			attr_dev(g0, "class", "svelte-15wt7c8");
    			add_location(g0, file$8, 46, 6, 2525);
    			set_style(g1, "transform", "scale(" + /*scale*/ ctx[10] + ")");
    			attr_dev(g1, "class", "svelte-15wt7c8");
    			add_location(g1, file$8, 45, 4, 2481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g1, anchor);
    			append_dev(g1, g0);
    			g0.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*numberOfElements, durationInSeconds*/ 3 && g0_style_value !== (g0_style_value = [
    				`--rotation: ${Math.random() * 360}deg`,
    				`animation-delay: ${quadIn(/*i*/ ctx[12] / /*numberOfElements*/ ctx[0])}s`,
    				`animation-duration: ${/*durationInSeconds*/ ctx[1] * /*randomNumber*/ ctx[2](0.7, 1)}s`
    			].join(";"))) {
    				attr_dev(g0, "style", g0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(45:2) {#each allElements as [element, color, scale], i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svg;
    	let each_value = /*allElements*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "class", "confetti svelte-15wt7c8");
    			attr_dev(svg, "viewBox", "-10 -10 10 10");
    			add_location(svg, file$8, 43, 0, 2378);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*allElements, Math, quadIn, numberOfElements, durationInSeconds, randomNumber*/ 15) {
    				each_value = /*allElements*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Confetti", slots, []);
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
    	const writable_props = ["numberOfElements", "durationInSeconds", "colors"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Confetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("numberOfElements" in $$props) $$invalidate(0, numberOfElements = $$props.numberOfElements);
    		if ("durationInSeconds" in $$props) $$invalidate(1, durationInSeconds = $$props.durationInSeconds);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    	};

    	$$self.$capture_state = () => ({
    		quadIn,
    		numberOfElements,
    		durationInSeconds,
    		colors,
    		pickFrom,
    		randomNumber,
    		getManyOf,
    		elementOptions,
    		allElements
    	});

    	$$self.$inject_state = $$props => {
    		if ("numberOfElements" in $$props) $$invalidate(0, numberOfElements = $$props.numberOfElements);
    		if ("durationInSeconds" in $$props) $$invalidate(1, durationInSeconds = $$props.durationInSeconds);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [numberOfElements, durationInSeconds, randomNumber, allElements, colors];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			numberOfElements: 0,
    			durationInSeconds: 1,
    			colors: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get numberOfElements() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numberOfElements(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get durationInSeconds() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set durationInSeconds(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-crossword/src/CompletedMessage.svelte generated by Svelte v3.29.4 */
    const file$9 = "node_modules/svelte-crossword/src/CompletedMessage.svelte";
    const get_message_slot_changes = dirty => ({});
    const get_message_slot_context = ctx => ({});

    // (10:0) {#if isOpen}
    function create_if_block$5(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let button;
    	let t2;
    	let div2_transition;
    	let t3;
    	let div3;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const message_slot_template = /*#slots*/ ctx[3].message;
    	const message_slot = create_slot(message_slot_template, ctx, /*$$scope*/ ctx[2], get_message_slot_context);
    	const message_slot_or_fallback = message_slot || fallback_block(ctx);
    	let if_block = /*showConfetti*/ ctx[0] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (message_slot_or_fallback) message_slot_or_fallback.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "View puzzle";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "message svelte-9a7qrw");
    			add_location(div0, file$9, 12, 6, 266);
    			attr_dev(button, "class", "svelte-9a7qrw");
    			add_location(button, file$9, 18, 6, 388);
    			attr_dev(div1, "class", "content svelte-9a7qrw");
    			add_location(div1, file$9, 11, 4, 238);
    			attr_dev(div2, "class", "completed svelte-9a7qrw");
    			add_location(div2, file$9, 10, 2, 180);
    			attr_dev(div3, "class", "curtain svelte-9a7qrw");
    			add_location(div3, file$9, 27, 2, 572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (message_slot_or_fallback) {
    				message_slot_or_fallback.m(div0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, button);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(div3, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (message_slot) {
    				if (message_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(message_slot, message_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_message_slot_changes, get_message_slot_context);
    				}
    			}

    			if (/*showConfetti*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*showConfetti*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(message_slot_or_fallback, local);
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 250 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(message_slot_or_fallback, local);
    			transition_out(if_block);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { y: 20 }, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 250 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (message_slot_or_fallback) message_slot_or_fallback.d(detaching);
    			if (if_block) if_block.d();
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(10:0) {#if isOpen}",
    		ctx
    	});

    	return block;
    }

    // (14:29)            
    function fallback_block(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "You solved it!";
    			attr_dev(h3, "class", "svelte-9a7qrw");
    			add_location(h3, file$9, 14, 10, 328);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(14:29)            ",
    		ctx
    	});

    	return block;
    }

    // (22:4) {#if showConfetti}
    function create_if_block_1$1(ctx) {
    	let div;
    	let confetti;
    	let current;
    	confetti = new Confetti({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(confetti.$$.fragment);
    			attr_dev(div, "class", "confetti svelte-9a7qrw");
    			add_location(div, file$9, 22, 6, 494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(confetti, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(22:4) {#if showConfetti}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isOpen*/ ctx[1] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isOpen*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*isOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CompletedMessage", slots, ['message']);
    	let { showConfetti = true } = $$props;
    	let isOpen = true;
    	const writable_props = ["showConfetti"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CompletedMessage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, isOpen = false);
    	const click_handler_1 = () => $$invalidate(1, isOpen = false);

    	$$self.$$set = $$props => {
    		if ("showConfetti" in $$props) $$invalidate(0, showConfetti = $$props.showConfetti);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade, Confetti, showConfetti, isOpen });

    	$$self.$inject_state = $$props => {
    		if ("showConfetti" in $$props) $$invalidate(0, showConfetti = $$props.showConfetti);
    		if ("isOpen" in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showConfetti, isOpen, $$scope, slots, click_handler, click_handler_1];
    }

    class CompletedMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { showConfetti: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompletedMessage",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get showConfetti() {
    		throw new Error("<CompletedMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showConfetti(value) {
    		throw new Error("<CompletedMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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

    /* node_modules/svelte-crossword/src/Crossword.svelte generated by Svelte v3.29.4 */
    const file$a = "node_modules/svelte-crossword/src/Crossword.svelte";
    const get_complete_slot_changes = dirty => ({});
    const get_complete_slot_context = ctx => ({});
    const get_toolbar_slot_changes = dirty => ({});

    const get_toolbar_slot_context = ctx => ({
    	onClear: /*onClear*/ ctx[18],
    	onReveal: /*onReveal*/ ctx[19]
    });

    // (115:0) {#if validated}
    function create_if_block$6(ctx) {
    	let article;
    	let t0;
    	let div;
    	let clues_1;
    	let updating_focusedCellIndex;
    	let updating_focusedCell;
    	let updating_focusedDirection;
    	let t1;
    	let puzzle;
    	let updating_cells;
    	let updating_focusedCellIndex_1;
    	let updating_focusedDirection_1;
    	let t2;
    	let article_class_value;
    	let article_resize_listener;
    	let current;
    	const toolbar_slot_template = /*#slots*/ ctx[26].toolbar;
    	const toolbar_slot = create_slot(toolbar_slot_template, ctx, /*$$scope*/ ctx[34], get_toolbar_slot_context);
    	const toolbar_slot_or_fallback = toolbar_slot || fallback_block$1(ctx);

    	function clues_1_focusedCellIndex_binding(value) {
    		/*clues_1_focusedCellIndex_binding*/ ctx[27].call(null, value);
    	}

    	function clues_1_focusedCell_binding(value) {
    		/*clues_1_focusedCell_binding*/ ctx[28].call(null, value);
    	}

    	function clues_1_focusedDirection_binding(value) {
    		/*clues_1_focusedDirection_binding*/ ctx[29].call(null, value);
    	}

    	let clues_1_props = {
    		clues: /*clues*/ ctx[10],
    		cellIndexMap: /*cellIndexMap*/ ctx[13],
    		stacked: /*stacked*/ ctx[17]
    	};

    	if (/*focusedCellIndex*/ ctx[7] !== void 0) {
    		clues_1_props.focusedCellIndex = /*focusedCellIndex*/ ctx[7];
    	}

    	if (/*focusedCell*/ ctx[12] !== void 0) {
    		clues_1_props.focusedCell = /*focusedCell*/ ctx[12];
    	}

    	if (/*focusedDirection*/ ctx[6] !== void 0) {
    		clues_1_props.focusedDirection = /*focusedDirection*/ ctx[6];
    	}

    	clues_1 = new Clues({ props: clues_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(clues_1, "focusedCellIndex", clues_1_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedCell", clues_1_focusedCell_binding));
    	binding_callbacks.push(() => bind(clues_1, "focusedDirection", clues_1_focusedDirection_binding));

    	function puzzle_cells_binding(value) {
    		/*puzzle_cells_binding*/ ctx[30].call(null, value);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		/*puzzle_focusedCellIndex_binding*/ ctx[31].call(null, value);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		/*puzzle_focusedDirection_binding*/ ctx[32].call(null, value);
    	}

    	let puzzle_props = {
    		clues: /*clues*/ ctx[10],
    		focusedCell: /*focusedCell*/ ctx[12],
    		isRevealing: /*isRevealing*/ ctx[8],
    		isDisableHighlight: /*isDisableHighlight*/ ctx[16],
    		revealDuration: /*revealDuration*/ ctx[1],
    		showKeyboard: /*showKeyboard*/ ctx[4],
    		stacked: /*stacked*/ ctx[17]
    	};

    	if (/*cells*/ ctx[11] !== void 0) {
    		puzzle_props.cells = /*cells*/ ctx[11];
    	}

    	if (/*focusedCellIndex*/ ctx[7] !== void 0) {
    		puzzle_props.focusedCellIndex = /*focusedCellIndex*/ ctx[7];
    	}

    	if (/*focusedDirection*/ ctx[6] !== void 0) {
    		puzzle_props.focusedDirection = /*focusedDirection*/ ctx[6];
    	}

    	puzzle = new Puzzle({ props: puzzle_props, $$inline: true });
    	binding_callbacks.push(() => bind(puzzle, "cells", puzzle_cells_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedCellIndex", puzzle_focusedCellIndex_binding));
    	binding_callbacks.push(() => bind(puzzle, "focusedDirection", puzzle_focusedDirection_binding));
    	let if_block = /*isComplete*/ ctx[14] && !/*isRevealing*/ ctx[8] && /*showCompleteMessage*/ ctx[2] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.c();
    			t0 = space();
    			div = element("div");
    			create_component(clues_1.$$.fragment);
    			t1 = space();
    			create_component(puzzle.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "play svelte-1ein5he");
    			toggle_class(div, "stacked", /*stacked*/ ctx[17]);
    			add_location(div, file$a, 120, 4, 3362);
    			attr_dev(article, "class", article_class_value = "crossword " + /*themeClass*/ ctx[15] + " svelte-1ein5he");
    			add_render_callback(() => /*article_elementresize_handler*/ ctx[33].call(article));
    			add_location(article, file$a, 115, 2, 3143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);

    			if (toolbar_slot_or_fallback) {
    				toolbar_slot_or_fallback.m(article, null);
    			}

    			append_dev(article, t0);
    			append_dev(article, div);
    			mount_component(clues_1, div, null);
    			append_dev(div, t1);
    			mount_component(puzzle, div, null);
    			append_dev(article, t2);
    			if (if_block) if_block.m(article, null);
    			article_resize_listener = add_resize_listener(article, /*article_elementresize_handler*/ ctx[33].bind(article));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (toolbar_slot) {
    				if (toolbar_slot.p && dirty[1] & /*$$scope*/ 8) {
    					update_slot(toolbar_slot, toolbar_slot_template, ctx, /*$$scope*/ ctx[34], dirty, get_toolbar_slot_changes, get_toolbar_slot_context);
    				}
    			} else {
    				if (toolbar_slot_or_fallback && toolbar_slot_or_fallback.p && dirty[0] & /*actions*/ 1) {
    					toolbar_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			const clues_1_changes = {};
    			if (dirty[0] & /*clues*/ 1024) clues_1_changes.clues = /*clues*/ ctx[10];
    			if (dirty[0] & /*cellIndexMap*/ 8192) clues_1_changes.cellIndexMap = /*cellIndexMap*/ ctx[13];
    			if (dirty[0] & /*stacked*/ 131072) clues_1_changes.stacked = /*stacked*/ ctx[17];

    			if (!updating_focusedCellIndex && dirty[0] & /*focusedCellIndex*/ 128) {
    				updating_focusedCellIndex = true;
    				clues_1_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[7];
    				add_flush_callback(() => updating_focusedCellIndex = false);
    			}

    			if (!updating_focusedCell && dirty[0] & /*focusedCell*/ 4096) {
    				updating_focusedCell = true;
    				clues_1_changes.focusedCell = /*focusedCell*/ ctx[12];
    				add_flush_callback(() => updating_focusedCell = false);
    			}

    			if (!updating_focusedDirection && dirty[0] & /*focusedDirection*/ 64) {
    				updating_focusedDirection = true;
    				clues_1_changes.focusedDirection = /*focusedDirection*/ ctx[6];
    				add_flush_callback(() => updating_focusedDirection = false);
    			}

    			clues_1.$set(clues_1_changes);
    			const puzzle_changes = {};
    			if (dirty[0] & /*clues*/ 1024) puzzle_changes.clues = /*clues*/ ctx[10];
    			if (dirty[0] & /*focusedCell*/ 4096) puzzle_changes.focusedCell = /*focusedCell*/ ctx[12];
    			if (dirty[0] & /*isRevealing*/ 256) puzzle_changes.isRevealing = /*isRevealing*/ ctx[8];
    			if (dirty[0] & /*isDisableHighlight*/ 65536) puzzle_changes.isDisableHighlight = /*isDisableHighlight*/ ctx[16];
    			if (dirty[0] & /*revealDuration*/ 2) puzzle_changes.revealDuration = /*revealDuration*/ ctx[1];
    			if (dirty[0] & /*showKeyboard*/ 16) puzzle_changes.showKeyboard = /*showKeyboard*/ ctx[4];
    			if (dirty[0] & /*stacked*/ 131072) puzzle_changes.stacked = /*stacked*/ ctx[17];

    			if (!updating_cells && dirty[0] & /*cells*/ 2048) {
    				updating_cells = true;
    				puzzle_changes.cells = /*cells*/ ctx[11];
    				add_flush_callback(() => updating_cells = false);
    			}

    			if (!updating_focusedCellIndex_1 && dirty[0] & /*focusedCellIndex*/ 128) {
    				updating_focusedCellIndex_1 = true;
    				puzzle_changes.focusedCellIndex = /*focusedCellIndex*/ ctx[7];
    				add_flush_callback(() => updating_focusedCellIndex_1 = false);
    			}

    			if (!updating_focusedDirection_1 && dirty[0] & /*focusedDirection*/ 64) {
    				updating_focusedDirection_1 = true;
    				puzzle_changes.focusedDirection = /*focusedDirection*/ ctx[6];
    				add_flush_callback(() => updating_focusedDirection_1 = false);
    			}

    			puzzle.$set(puzzle_changes);

    			if (dirty[0] & /*stacked*/ 131072) {
    				toggle_class(div, "stacked", /*stacked*/ ctx[17]);
    			}

    			if (/*isComplete*/ ctx[14] && !/*isRevealing*/ ctx[8] && /*showCompleteMessage*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isComplete, isRevealing, showCompleteMessage*/ 16644) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(article, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*themeClass*/ 32768 && article_class_value !== (article_class_value = "crossword " + /*themeClass*/ ctx[15] + " svelte-1ein5he")) {
    				attr_dev(article, "class", article_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbar_slot_or_fallback, local);
    			transition_in(clues_1.$$.fragment, local);
    			transition_in(puzzle.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbar_slot_or_fallback, local);
    			transition_out(clues_1.$$.fragment, local);
    			transition_out(puzzle.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (toolbar_slot_or_fallback) toolbar_slot_or_fallback.d(detaching);
    			destroy_component(clues_1);
    			destroy_component(puzzle);
    			if (if_block) if_block.d();
    			article_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(115:0) {#if validated}",
    		ctx
    	});

    	return block;
    }

    // (117:67)        
    function fallback_block$1(ctx) {
    	let toolbar;
    	let current;

    	toolbar = new Toolbar({
    			props: { actions: /*actions*/ ctx[0] },
    			$$inline: true
    		});

    	toolbar.$on("event", /*onToolbarEvent*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(toolbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(toolbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toolbar_changes = {};
    			if (dirty[0] & /*actions*/ 1) toolbar_changes.actions = /*actions*/ ctx[0];
    			toolbar.$set(toolbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toolbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toolbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(toolbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(117:67)        ",
    		ctx
    	});

    	return block;
    }

    // (142:4) {#if isComplete && !isRevealing && showCompleteMessage}
    function create_if_block_1$2(ctx) {
    	let completedmessage;
    	let current;

    	completedmessage = new CompletedMessage({
    			props: {
    				showConfetti: /*showConfetti*/ ctx[3],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(completedmessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(completedmessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const completedmessage_changes = {};
    			if (dirty[0] & /*showConfetti*/ 8) completedmessage_changes.showConfetti = /*showConfetti*/ ctx[3];

    			if (dirty[1] & /*$$scope*/ 8) {
    				completedmessage_changes.$$scope = { dirty, ctx };
    			}

    			completedmessage.$set(completedmessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(completedmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(completedmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(completedmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(142:4) {#if isComplete && !isRevealing && showCompleteMessage}",
    		ctx
    	});

    	return block;
    }

    // (143:6) <CompletedMessage showConfetti="{showConfetti}">
    function create_default_slot(ctx) {
    	let current;
    	const complete_slot_template = /*#slots*/ ctx[26].complete;
    	const complete_slot = create_slot(complete_slot_template, ctx, /*$$scope*/ ctx[34], get_complete_slot_context);

    	const block = {
    		c: function create() {
    			if (complete_slot) complete_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (complete_slot) {
    				complete_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (complete_slot) {
    				if (complete_slot.p && dirty[1] & /*$$scope*/ 8) {
    					update_slot(complete_slot, complete_slot_template, ctx, /*$$scope*/ ctx[34], dirty, get_complete_slot_changes, get_complete_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(complete_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(complete_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (complete_slot) complete_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(143:6) <CompletedMessage showConfetti=\\\"{showConfetti}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*validated*/ ctx[9] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*validated*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*validated*/ 512) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Crossword", slots, ['toolbar','complete']);
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
    	let clueCompletion;
    	let originalClues = [];
    	let validated = [];
    	let clues = [];
    	let cells = [];

    	const onDataUpdate = () => {
    		originalClues = createClues(data);
    		$$invalidate(9, validated = validateClues(originalClues));
    		$$invalidate(10, clues = originalClues.map(d => ({ ...d })));
    		$$invalidate(11, cells = createCells(originalClues));
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
    		$$invalidate(8, isRevealing = false);
    		$$invalidate(7, focusedCellIndex = 0);
    		$$invalidate(6, focusedDirection = "across");
    	}

    	function onClear() {
    		reset();
    		if (revealTimeout) clearTimeout(revealTimeout);
    		$$invalidate(11, cells = cells.map(cell => ({ ...cell, value: "" })));
    		$$invalidate(21, revealed = false);
    	}

    	function onReveal() {
    		if (revealed) return true;
    		reset();
    		$$invalidate(11, cells = cells.map(cell => ({ ...cell, value: cell.answer })));
    		$$invalidate(21, revealed = true);
    		startReveal();
    	}

    	function startReveal() {
    		$$invalidate(8, isRevealing = true);
    		if (revealTimeout) clearTimeout(revealTimeout);

    		revealTimeout = setTimeout(
    			() => {
    				$$invalidate(8, isRevealing = false);
    			},
    			revealDuration + 250
    		);
    	}

    	function onToolbarEvent({ detail }) {
    		if (detail === "clear") onClear(); else if (detail === "reveal") onReveal();
    	}

    	const writable_props = [
    		"data",
    		"actions",
    		"theme",
    		"revealDuration",
    		"breakpoint",
    		"revealed",
    		"disableHighlight",
    		"showCompleteMessage",
    		"showConfetti",
    		"showKeyboard"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Crossword> was created with unknown prop '${key}'`);
    	});

    	function clues_1_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(7, focusedCellIndex);
    	}

    	function clues_1_focusedCell_binding(value) {
    		focusedCell = value;
    		(($$invalidate(12, focusedCell), $$invalidate(11, cells)), $$invalidate(7, focusedCellIndex));
    	}

    	function clues_1_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(6, focusedDirection);
    	}

    	function puzzle_cells_binding(value) {
    		cells = value;
    		$$invalidate(11, cells);
    	}

    	function puzzle_focusedCellIndex_binding(value) {
    		focusedCellIndex = value;
    		$$invalidate(7, focusedCellIndex);
    	}

    	function puzzle_focusedDirection_binding(value) {
    		focusedDirection = value;
    		$$invalidate(6, focusedDirection);
    	}

    	function article_elementresize_handler() {
    		width = this.offsetWidth;
    		$$invalidate(5, width);
    	}

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(22, data = $$props.data);
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    		if ("theme" in $$props) $$invalidate(23, theme = $$props.theme);
    		if ("revealDuration" in $$props) $$invalidate(1, revealDuration = $$props.revealDuration);
    		if ("breakpoint" in $$props) $$invalidate(24, breakpoint = $$props.breakpoint);
    		if ("revealed" in $$props) $$invalidate(21, revealed = $$props.revealed);
    		if ("disableHighlight" in $$props) $$invalidate(25, disableHighlight = $$props.disableHighlight);
    		if ("showCompleteMessage" in $$props) $$invalidate(2, showCompleteMessage = $$props.showCompleteMessage);
    		if ("showConfetti" in $$props) $$invalidate(3, showConfetti = $$props.showConfetti);
    		if ("showKeyboard" in $$props) $$invalidate(4, showKeyboard = $$props.showKeyboard);
    		if ("$$scope" in $$props) $$invalidate(34, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Toolbar,
    		Puzzle,
    		Clues,
    		CompletedMessage,
    		createClues,
    		createCells,
    		validateClues,
    		fromPairs,
    		data,
    		actions,
    		theme,
    		revealDuration,
    		breakpoint,
    		revealed,
    		disableHighlight,
    		showCompleteMessage,
    		showConfetti,
    		showKeyboard,
    		width,
    		focusedDirection,
    		focusedCellIndex,
    		isRevealing,
    		revealTimeout,
    		clueCompletion,
    		originalClues,
    		validated,
    		clues,
    		cells,
    		onDataUpdate,
    		checkClues,
    		reset,
    		onClear,
    		onReveal,
    		startReveal,
    		onToolbarEvent,
    		focusedCell,
    		cellIndexMap,
    		percentCorrect,
    		isComplete,
    		themeClass,
    		isDisableHighlight,
    		stacked
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(22, data = $$props.data);
    		if ("actions" in $$props) $$invalidate(0, actions = $$props.actions);
    		if ("theme" in $$props) $$invalidate(23, theme = $$props.theme);
    		if ("revealDuration" in $$props) $$invalidate(1, revealDuration = $$props.revealDuration);
    		if ("breakpoint" in $$props) $$invalidate(24, breakpoint = $$props.breakpoint);
    		if ("revealed" in $$props) $$invalidate(21, revealed = $$props.revealed);
    		if ("disableHighlight" in $$props) $$invalidate(25, disableHighlight = $$props.disableHighlight);
    		if ("showCompleteMessage" in $$props) $$invalidate(2, showCompleteMessage = $$props.showCompleteMessage);
    		if ("showConfetti" in $$props) $$invalidate(3, showConfetti = $$props.showConfetti);
    		if ("showKeyboard" in $$props) $$invalidate(4, showKeyboard = $$props.showKeyboard);
    		if ("width" in $$props) $$invalidate(5, width = $$props.width);
    		if ("focusedDirection" in $$props) $$invalidate(6, focusedDirection = $$props.focusedDirection);
    		if ("focusedCellIndex" in $$props) $$invalidate(7, focusedCellIndex = $$props.focusedCellIndex);
    		if ("isRevealing" in $$props) $$invalidate(8, isRevealing = $$props.isRevealing);
    		if ("revealTimeout" in $$props) revealTimeout = $$props.revealTimeout;
    		if ("clueCompletion" in $$props) clueCompletion = $$props.clueCompletion;
    		if ("originalClues" in $$props) originalClues = $$props.originalClues;
    		if ("validated" in $$props) $$invalidate(9, validated = $$props.validated);
    		if ("clues" in $$props) $$invalidate(10, clues = $$props.clues);
    		if ("cells" in $$props) $$invalidate(11, cells = $$props.cells);
    		if ("focusedCell" in $$props) $$invalidate(12, focusedCell = $$props.focusedCell);
    		if ("cellIndexMap" in $$props) $$invalidate(13, cellIndexMap = $$props.cellIndexMap);
    		if ("percentCorrect" in $$props) $$invalidate(37, percentCorrect = $$props.percentCorrect);
    		if ("isComplete" in $$props) $$invalidate(14, isComplete = $$props.isComplete);
    		if ("themeClass" in $$props) $$invalidate(15, themeClass = $$props.themeClass);
    		if ("isDisableHighlight" in $$props) $$invalidate(16, isDisableHighlight = $$props.isDisableHighlight);
    		if ("stacked" in $$props) $$invalidate(17, stacked = $$props.stacked);
    	};

    	let focusedCell;
    	let cellIndexMap;
    	let percentCorrect;
    	let isComplete;
    	let themeClass;
    	let isDisableHighlight;
    	let stacked;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data*/ 4194304) {
    			 (onDataUpdate());
    		}

    		if ($$self.$$.dirty[0] & /*cells, focusedCellIndex*/ 2176) {
    			 $$invalidate(12, focusedCell = cells[focusedCellIndex] || {});
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 2048) {
    			 $$invalidate(13, cellIndexMap = fromPairs(cells.map(cell => [cell.id, cell.index])));
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 2048) {
    			 $$invalidate(37, percentCorrect = cells.filter(d => d.answer === d.value).length / cells.length);
    		}

    		if ($$self.$$.dirty[1] & /*percentCorrect*/ 64) {
    			 $$invalidate(14, isComplete = percentCorrect == 1);
    		}

    		if ($$self.$$.dirty[0] & /*theme*/ 8388608) {
    			 $$invalidate(15, themeClass = theme ? `theme-${theme}` : "");
    		}

    		if ($$self.$$.dirty[0] & /*isComplete, disableHighlight*/ 33570816) {
    			 $$invalidate(16, isDisableHighlight = isComplete && disableHighlight);
    		}

    		if ($$self.$$.dirty[0] & /*cells*/ 2048) {
    			 ($$invalidate(10, clues = checkClues()));
    		}

    		if ($$self.$$.dirty[0] & /*width, breakpoint*/ 16777248) {
    			 $$invalidate(17, stacked = width < breakpoint);
    		}
    	};

    	return [
    		actions,
    		revealDuration,
    		showCompleteMessage,
    		showConfetti,
    		showKeyboard,
    		width,
    		focusedDirection,
    		focusedCellIndex,
    		isRevealing,
    		validated,
    		clues,
    		cells,
    		focusedCell,
    		cellIndexMap,
    		isComplete,
    		themeClass,
    		isDisableHighlight,
    		stacked,
    		onClear,
    		onReveal,
    		onToolbarEvent,
    		revealed,
    		data,
    		theme,
    		breakpoint,
    		disableHighlight,
    		slots,
    		clues_1_focusedCellIndex_binding,
    		clues_1_focusedCell_binding,
    		clues_1_focusedDirection_binding,
    		puzzle_cells_binding,
    		puzzle_focusedCellIndex_binding,
    		puzzle_focusedDirection_binding,
    		article_elementresize_handler,
    		$$scope
    	];
    }

    class Crossword extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				data: 22,
    				actions: 0,
    				theme: 23,
    				revealDuration: 1,
    				breakpoint: 24,
    				revealed: 21,
    				disableHighlight: 25,
    				showCompleteMessage: 2,
    				showConfetti: 3,
    				showKeyboard: 4
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crossword",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get data() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actions() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actions(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealDuration() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealDuration(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get breakpoint() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set breakpoint(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get revealed() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set revealed(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableHighlight() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableHighlight(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showCompleteMessage() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showCompleteMessage(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showConfetti() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showConfetti(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showKeyboard() {
    		throw new Error("<Crossword>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showKeyboard(value) {
    		throw new Error("<Crossword>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

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
    const file$b = "src/components/App.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].id;
    	child_ctx[9] = list[i].decade;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i].id;
    	child_ctx[12] = list[i].pub;
    	return child_ctx;
    }

    // (61:4) {#each puzzlesToday as { id, pub }}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t_value = /*pub*/ ctx[12] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[8];
    			option.value = option.__value;
    			add_location(option, file$b, 61, 6, 2330);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(61:4) {#each puzzlesToday as { id, pub }}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {#each puzzlesNYT as { id, decade }}
    function create_each_block$6(ctx) {
    	let option;
    	let t_value = /*decade*/ ctx[9] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*id*/ ctx[8];
    			option.value = option.__value;
    			add_location(option, file$b, 92, 6, 3080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(92:4) {#each puzzlesNYT as { id, decade }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let p1;
    	let button;
    	let t7;
    	let section0;
    	let h20;
    	let t9;
    	let p2;
    	let t11;
    	let select0;
    	let t12;
    	let h30;
    	let t13_value = /*puzzleT*/ ctx[2].pub + "";
    	let t13;
    	let t14;
    	let p3;
    	let t15;
    	let t16_value = /*puzzleT*/ ctx[2].pub + "";
    	let t16;
    	let t17;
    	let span1;
    	let span0;
    	let t19;
    	let t20;
    	let span3;
    	let span2;
    	let t22;
    	let t23;
    	let t24;
    	let div1;
    	let crossword0;
    	let t25;
    	let p4;
    	let em0;
    	let t27;
    	let section1;
    	let h21;
    	let t29;
    	let p5;
    	let t31;
    	let select1;
    	let t32;
    	let h31;
    	let t33_value = /*puzzleN*/ ctx[3].decade + "";
    	let t33;
    	let t34;
    	let p6;
    	let t35;
    	let t36_value = /*puzzleN*/ ctx[3].decade + "";
    	let t36;
    	let t37;
    	let span5;
    	let span4;
    	let t39;
    	let t40;
    	let span7;
    	let span6;
    	let t42;
    	let t43;
    	let t44;
    	let div2;
    	let crossword1;
    	let t45;
    	let p7;
    	let em1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*puzzlesToday*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	crossword0 = new Crossword({
    			props: { data: /*puzzleT*/ ctx[2].data },
    			$$inline: true
    		});

    	let each_value = /*puzzlesNYT*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	crossword1 = new Crossword({
    			props: { data: /*puzzleN*/ ctx[3].data },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Representative Crossword Puzzles";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("We published\n    ");
    			a = element("a");
    			a.textContent = "a story";
    			t4 = text("\n    about how inclusive crossword puzzles are, by the numbers, when it comes to\n    racial and gender represntation. Below, you will find that data converted\n    into playable puzzles. The people used in the clue and answers reflect the\n    findings of our analysis.");
    			t5 = space();
    			p1 = element("p");
    			button = element("button");
    			button.textContent = "How were these made?";
    			t7 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Publications in 2020";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Choose a publication";
    			t11 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t12 = space();
    			h30 = element("h3");
    			t13 = text(t13_value);
    			t14 = space();
    			p3 = element("p");
    			t15 = text("In the\n    ");
    			t16 = text(t16_value);
    			t17 = text("\n    puzzles, we found that\n    ");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "10%";
    			t19 = text("\n      of people were women");
    			t20 = text("\n    and\n    ");
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "30%";
    			t22 = text("\n      were underrepresented minorities");
    			t23 = text(".");
    			t24 = space();
    			div1 = element("div");
    			create_component(crossword0.$$.fragment);
    			t25 = space();
    			p4 = element("p");
    			em0 = element("em");
    			em0.textContent = "Note: findings are rounded to the nearest 10% for puzzle depiction\n        purposes.";
    			t27 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "New York Times, through time";
    			t29 = space();
    			p5 = element("p");
    			p5.textContent = "Choose a decade";
    			t31 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t32 = space();
    			h31 = element("h3");
    			t33 = text(t33_value);
    			t34 = space();
    			p6 = element("p");
    			t35 = text("In the\n    ");
    			t36 = text(t36_value);
    			t37 = text("\n    puzzles, we found that\n    ");
    			span5 = element("span");
    			span4 = element("span");
    			span4.textContent = "10%";
    			t39 = text("\n      of people were women");
    			t40 = text("\n    and\n    ");
    			span7 = element("span");
    			span6 = element("span");
    			span6.textContent = "30%";
    			t42 = text("\n      were underrepresented minorities");
    			t43 = text(".");
    			t44 = space();
    			div2 = element("div");
    			create_component(crossword1.$$.fragment);
    			t45 = space();
    			p7 = element("p");
    			em1 = element("em");
    			em1.textContent = "Note: findings are rounded to the nearest 10% for puzzle depiction\n        purposes.";
    			attr_dev(h1, "class", "svelte-rg0utu");
    			add_location(h1, file$b, 44, 2, 1707);
    			attr_dev(a, "href", "https://pudding.cool/2020/11/crossword");
    			add_location(a, file$b, 47, 4, 1776);
    			attr_dev(p0, "class", "svelte-rg0utu");
    			add_location(p0, file$b, 45, 2, 1751);
    			add_location(button, file$b, 53, 5, 2116);
    			attr_dev(p1, "class", "svelte-rg0utu");
    			add_location(p1, file$b, 53, 2, 2113);
    			attr_dev(div0, "id", "intro");
    			attr_dev(div0, "class", "svelte-rg0utu");
    			add_location(div0, file$b, 43, 0, 1688);
    			attr_dev(h20, "class", "svelte-rg0utu");
    			add_location(h20, file$b, 57, 2, 2189);
    			add_location(p2, file$b, 58, 2, 2221);
    			if (/*currentT*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[6].call(select0));
    			add_location(select0, file$b, 59, 2, 2251);
    			add_location(h30, file$b, 65, 2, 2393);
    			attr_dev(span0, "class", "percent");
    			add_location(span0, file$b, 71, 24, 2519);
    			attr_dev(span1, "class", "women");
    			add_location(span1, file$b, 71, 4, 2499);
    			attr_dev(span2, "class", "percent");
    			add_location(span2, file$b, 74, 22, 2616);
    			attr_dev(span3, "class", "urm");
    			add_location(span3, file$b, 74, 4, 2598);
    			attr_dev(p3, "class", "insight");
    			add_location(p3, file$b, 67, 2, 2419);
    			add_location(em0, file$b, 81, 6, 2790);
    			attr_dev(p4, "class", "note");
    			add_location(p4, file$b, 80, 4, 2767);
    			attr_dev(div1, "class", "xd svelte-rg0utu");
    			add_location(div1, file$b, 78, 2, 2706);
    			attr_dev(section0, "id", "today");
    			attr_dev(section0, "class", "svelte-rg0utu");
    			add_location(section0, file$b, 56, 0, 2166);
    			attr_dev(h21, "class", "svelte-rg0utu");
    			add_location(h21, file$b, 88, 2, 2935);
    			add_location(p5, file$b, 89, 2, 2975);
    			if (/*currentN*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[7].call(select1));
    			add_location(select1, file$b, 90, 2, 3000);
    			add_location(h31, file$b, 96, 2, 3146);
    			attr_dev(span4, "class", "percent");
    			add_location(span4, file$b, 102, 24, 3278);
    			attr_dev(span5, "class", "women");
    			add_location(span5, file$b, 102, 4, 3258);
    			attr_dev(span6, "class", "percent");
    			add_location(span6, file$b, 105, 22, 3375);
    			attr_dev(span7, "class", "urm");
    			add_location(span7, file$b, 105, 4, 3357);
    			attr_dev(p6, "class", "insight");
    			add_location(p6, file$b, 98, 2, 3175);
    			add_location(em1, file$b, 112, 6, 3549);
    			attr_dev(p7, "class", "note");
    			add_location(p7, file$b, 111, 4, 3526);
    			attr_dev(div2, "class", "xd svelte-rg0utu");
    			add_location(div2, file$b, 109, 2, 3465);
    			attr_dev(section1, "id", "nyt");
    			attr_dev(section1, "class", "svelte-rg0utu");
    			add_location(section1, file$b, 87, 0, 2914);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, a);
    			append_dev(p0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, p1);
    			append_dev(p1, button);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t9);
    			append_dev(section0, p2);
    			append_dev(section0, t11);
    			append_dev(section0, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*currentT*/ ctx[0]);
    			append_dev(section0, t12);
    			append_dev(section0, h30);
    			append_dev(h30, t13);
    			append_dev(section0, t14);
    			append_dev(section0, p3);
    			append_dev(p3, t15);
    			append_dev(p3, t16);
    			append_dev(p3, t17);
    			append_dev(p3, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t19);
    			append_dev(p3, t20);
    			append_dev(p3, span3);
    			append_dev(span3, span2);
    			append_dev(span3, t22);
    			append_dev(p3, t23);
    			append_dev(section0, t24);
    			append_dev(section0, div1);
    			mount_component(crossword0, div1, null);
    			append_dev(div1, t25);
    			append_dev(div1, p4);
    			append_dev(p4, em0);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t29);
    			append_dev(section1, p5);
    			append_dev(section1, t31);
    			append_dev(section1, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*currentN*/ ctx[1]);
    			append_dev(section1, t32);
    			append_dev(section1, h31);
    			append_dev(h31, t33);
    			append_dev(section1, t34);
    			append_dev(section1, p6);
    			append_dev(p6, t35);
    			append_dev(p6, t36);
    			append_dev(p6, t37);
    			append_dev(p6, span5);
    			append_dev(span5, span4);
    			append_dev(span5, t39);
    			append_dev(p6, t40);
    			append_dev(p6, span7);
    			append_dev(span7, span6);
    			append_dev(span7, t42);
    			append_dev(p6, t43);
    			append_dev(section1, t44);
    			append_dev(section1, div2);
    			mount_component(crossword1, div2, null);
    			append_dev(div2, t45);
    			append_dev(div2, p7);
    			append_dev(p7, em1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[6]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*puzzlesToday*/ 16) {
    				each_value_1 = /*puzzlesToday*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*currentT, puzzlesToday*/ 17) {
    				select_option(select0, /*currentT*/ ctx[0]);
    			}

    			if ((!current || dirty & /*puzzleT*/ 4) && t13_value !== (t13_value = /*puzzleT*/ ctx[2].pub + "")) set_data_dev(t13, t13_value);
    			if ((!current || dirty & /*puzzleT*/ 4) && t16_value !== (t16_value = /*puzzleT*/ ctx[2].pub + "")) set_data_dev(t16, t16_value);
    			const crossword0_changes = {};
    			if (dirty & /*puzzleT*/ 4) crossword0_changes.data = /*puzzleT*/ ctx[2].data;
    			crossword0.$set(crossword0_changes);

    			if (dirty & /*puzzlesNYT*/ 32) {
    				each_value = /*puzzlesNYT*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*currentN, puzzlesNYT*/ 34) {
    				select_option(select1, /*currentN*/ ctx[1]);
    			}

    			if ((!current || dirty & /*puzzleN*/ 8) && t33_value !== (t33_value = /*puzzleN*/ ctx[3].decade + "")) set_data_dev(t33, t33_value);
    			if ((!current || dirty & /*puzzleN*/ 8) && t36_value !== (t36_value = /*puzzleN*/ ctx[3].decade + "")) set_data_dev(t36, t36_value);
    			const crossword1_changes = {};
    			if (dirty & /*puzzleN*/ 8) crossword1_changes.data = /*puzzleN*/ ctx[3].data;
    			crossword1.$set(crossword1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crossword0.$$.fragment, local);
    			transition_in(crossword1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crossword0.$$.fragment, local);
    			transition_out(crossword1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(crossword0);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(section1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(crossword1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let currentT = "usa2020";
    	let currentN = "nyt1940s";

    	const puzzlesToday = [
    		{
    			id: "usa2020",
    			pub: "USA Today",
    			data: usa2020
    		},
    		{
    			id: "up2020",
    			pub: "Universal",
    			data: up2020
    		},
    		{
    			id: "nyt2020",
    			pub: "New York Times",
    			data: nyt2020
    		},
    		{
    			id: "lat2020",
    			pub: "LA Times",
    			data: lat2020
    		},
    		{
    			id: "wsj2020",
    			pub: "Wall Street Journal",
    			data: wsj2020
    		}
    	];

    	const puzzlesNYT = [
    		{
    			id: "nyt1940s",
    			decade: "1940s",
    			data: nyt1940s
    		},
    		{
    			id: "nyt1950s",
    			decade: "1950s",
    			data: nyt1950s
    		},
    		{
    			id: "nyt1960s",
    			decade: "1960s",
    			data: nyt1960s
    		},
    		{
    			id: "nyt1970s",
    			decade: "1970s",
    			data: nyt1970s
    		},
    		{
    			id: "nyt1980s",
    			decade: "1980s",
    			data: nyt1980s
    		},
    		{
    			id: "nyt1990s",
    			decade: "1990s",
    			data: nyt1990s
    		},
    		{
    			id: "nyt2000s",
    			decade: "2000s",
    			data: nyt2000s
    		},
    		{
    			id: "nyt2010s",
    			decade: "2010s",
    			data: nyt2010s
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		currentT = select_value(this);
    		$$invalidate(0, currentT);
    		$$invalidate(4, puzzlesToday);
    	}

    	function select1_change_handler() {
    		currentN = select_value(this);
    		$$invalidate(1, currentN);
    		$$invalidate(5, puzzlesNYT);
    	}

    	$$self.$capture_state = () => ({
    		Crossword,
    		usa2020,
    		up2020,
    		nyt2020,
    		lat2020,
    		wsj2020,
    		nyt1940s,
    		nyt1950s,
    		nyt1960s,
    		nyt1970s,
    		nyt1980s,
    		nyt1990s,
    		nyt2000s,
    		nyt2010s,
    		currentT,
    		currentN,
    		puzzlesToday,
    		puzzlesNYT,
    		puzzleT,
    		puzzleN
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentT" in $$props) $$invalidate(0, currentT = $$props.currentT);
    		if ("currentN" in $$props) $$invalidate(1, currentN = $$props.currentN);
    		if ("puzzleT" in $$props) $$invalidate(2, puzzleT = $$props.puzzleT);
    		if ("puzzleN" in $$props) $$invalidate(3, puzzleN = $$props.puzzleN);
    	};

    	let puzzleT;
    	let puzzleN;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentT*/ 1) {
    			 $$invalidate(2, puzzleT = puzzlesToday.find(d => d.id === currentT));
    		}

    		if ($$self.$$.dirty & /*currentN*/ 2) {
    			 $$invalidate(3, puzzleN = puzzlesNYT.find(d => d.id === currentN));
    		}
    	};

    	return [
    		currentT,
    		currentN,
    		puzzleT,
    		puzzleN,
    		puzzlesToday,
    		puzzlesNYT,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    const app = new App({
    	target: document.querySelector("main")
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
