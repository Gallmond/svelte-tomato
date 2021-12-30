
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function element(name) {
        return document.createElement(name);
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
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    const outroing = new Set();
    let outros;
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.2' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    /**
     * 
     * @param ms milliseconds
     * @param minutesOnly true to only return minutes
     * @param zeroPad true to left-pad single digits with zero
     * @returns minutes or minutes:seconds
     */
    const msToMinutesSeconds = (ms, minutesOnly = false, zeroPad = true) => {
      if (!ms) return "00:00";

      let seconds = ((ms / 1000) % 60).toFixed(0);
      let minutes = Math.floor(ms / 60000).toFixed(0);

      if(zeroPad){
        seconds = (seconds.length < 2 ? "0" : "") + seconds;
        minutes = (minutes.length < 2 ? "0" : "") + minutes;
      }

      return minutesOnly
        ? `${minutes}`
        : `${minutes}:${seconds}`
    };

    /**
     * 
     * @param minutes Minutes
     * @returns Milliseconds
     */
    const minutesToMs = (minutes) => {
      return minutes * 60 * 1000;
    };


    const getNotificationPermission = async () => {
      if(Notification.permission === 'granted') return true;
      const permission = await Notification.requestPermission();
      return permission === 'granted'
    };

    const sendNotification = async (text, notificationSounds = true) => {
      
      if(!await getNotificationPermission()) return;

      const notification = new Notification(text);
      if(notificationSounds){
        notification._audio = new Audio('/sound/bell-sound.mp3');
        notification._audio.play();
      }
      notification.onclick = (e) => {
        notification._audio && notification._audio.pause();
        console.log('notification.onclose', e);
      };
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const activeRunTime = writable(0);
    const loops = writable(0);
    const activeTimerName = writable("focus");
    const timers = writable([
      {
        name: "focus",
        length: 1000 * 60 * 50,
      },
      {
        name: "rest",
        length: 1000 * 60 * 10,
      },
      {
        name: "break",
        length: 1000 * 60 * 20,
      },
    ]);
    const userSettings = writable({
      // when a timer ends, scroll to the next one
      autoIncrementTimer: true,
      // if true, timer won't start automatically when the previous one ends.
      pauseBetweenTimers: false,
      // notification popup has a sound
      notificationSound: true,
      // focus-short break loops before long break
      focusRestLoops: 2,
    });

    /* src\Components\TimerSection.svelte generated by Svelte v3.44.2 */
    const file$8 = "src\\Components\\TimerSection.svelte";

    // (64:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("⚪");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:6) {#if active}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("🔴");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(62:6) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let h3;
    	let t1;
    	let t2;
    	let label;
    	let t3;
    	let label_for_value;
    	let t4;
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*active*/ ctx[1]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			label = element("label");
    			t3 = text("Timer length (minutes)");
    			t4 = space();
    			input = element("input");
    			add_location(div0, file$8, 60, 4, 1755);
    			add_location(div1, file$8, 59, 2, 1721);
    			add_location(h3, file$8, 69, 2, 1859);
    			attr_dev(label, "for", label_for_value = "" + (/*name*/ ctx[0] + "-timerLengthInput"));
    			add_location(label, file$8, 73, 2, 1953);
    			attr_dev(input, "id", input_id_value = "" + (/*name*/ ctx[0] + "-timerLengthInput"));
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = msToMinutesSeconds(/*thisTimerLength*/ ctx[2], true, false);
    			attr_dev(input, "class", "svelte-1w98p3f");
    			add_location(input, file$8, 74, 2, 2024);
    			attr_dev(div2, "class", "timeOption svelte-1w98p3f");
    			add_location(div2, file$8, 58, 0, 1693);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if_block.m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, h3);
    			append_dev(h3, t1);
    			append_dev(div2, t2);
    			append_dev(div2, label);
    			append_dev(label, t3);
    			append_dev(div2, t4);
    			append_dev(div2, input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*iconClicked*/ ctx[4], false, false, false),
    					listen_dev(input, "keyup", /*thisTimerLengthChanged*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);

    			if (dirty & /*name*/ 1 && label_for_value !== (label_for_value = "" + (/*name*/ ctx[0] + "-timerLengthInput"))) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*name*/ 1 && input_id_value !== (input_id_value = "" + (/*name*/ ctx[0] + "-timerLengthInput"))) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*thisTimerLength*/ 4 && input_value_value !== (input_value_value = msToMinutesSeconds(/*thisTimerLength*/ ctx[2], true, false)) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots('TimerSection', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name } = $$props;
    	let active;
    	let thisTimerLength = 0;
    	let thisTimerLengthFormatted;

    	// ===========================================================================
    	// is this timer active
    	activeTimerName.subscribe(val => {
    		$$invalidate(1, active = name === val);
    	});

    	// if a timer is updated, recalculate the length and formatted length display
    	timers.subscribe(dTimers => {
    		dTimers.some(dTimer => {
    			if (dTimer.name === name) {
    				$$invalidate(2, thisTimerLength = dTimer.length);
    				thisTimerLengthFormatted = msToMinutesSeconds(dTimer.length, true, false);
    				return true;
    			}
    		});
    	});

    	// handle keyups on the timer length change. After a third of a second update
    	// the appropriate timer's length
    	let keyUpTimeout = false;

    	const thisTimerLengthChanged = e => {
    		clearTimeout(keyUpTimeout);

    		keyUpTimeout = setTimeout(
    			() => {
    				timers.update(dTimers => {
    					for (let i = 0, l = dTimers.length; i < l; i++) {
    						if (dTimers[i].name === name) dTimers[i].length = minutesToMs(parseInt(e.target.value));
    					}

    					return dTimers;
    				});
    			},
    			1000 / 3
    		);
    	};

    	// when the icon is clicked, dispatch the 'selected' event with this timer's
    	// name
    	const iconClicked = e => {
    		activeTimerName.set(name);
    		dispatch("selected", { name });
    	};

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TimerSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		msToMinutesSeconds,
    		minutesToMs,
    		timers,
    		activeTimerName,
    		createEventDispatcher,
    		dispatch,
    		name,
    		active,
    		thisTimerLength,
    		thisTimerLengthFormatted,
    		keyUpTimeout,
    		thisTimerLengthChanged,
    		iconClicked
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('active' in $$props) $$invalidate(1, active = $$props.active);
    		if ('thisTimerLength' in $$props) $$invalidate(2, thisTimerLength = $$props.thisTimerLength);
    		if ('thisTimerLengthFormatted' in $$props) thisTimerLengthFormatted = $$props.thisTimerLengthFormatted;
    		if ('keyUpTimeout' in $$props) keyUpTimeout = $$props.keyUpTimeout;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, active, thisTimerLength, thisTimerLengthChanged, iconClicked];
    }

    class TimerSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimerSection",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<TimerSection> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<TimerSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TimerSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Prefabs\LoopsSection.svelte generated by Svelte v3.44.2 */
    const file$7 = "src\\Components\\Prefabs\\LoopsSection.svelte";

    function create_fragment$7(ctx) {
    	let div0;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*$userSettings*/ ctx[2].focusRestLoops + "";
    	let t3;
    	let t4;
    	let hr0;
    	let t5;
    	let div1;
    	let timersection0;
    	let t6;
    	let timersection1;
    	let t7;
    	let timersection2;
    	let t8;
    	let hr1;
    	let current;

    	timersection0 = new TimerSection({
    			props: { name: /*$timers*/ ctx[3][0].name },
    			$$inline: true
    		});

    	timersection0.$on("selected", function () {
    		if (is_function(/*onSelected*/ ctx[0])) /*onSelected*/ ctx[0].apply(this, arguments);
    	});

    	timersection1 = new TimerSection({
    			props: { name: /*$timers*/ ctx[3][1].name },
    			$$inline: true
    		});

    	timersection1.$on("selected", function () {
    		if (is_function(/*onSelected*/ ctx[0])) /*onSelected*/ ctx[0].apply(this, arguments);
    	});

    	timersection2 = new TimerSection({
    			props: { name: /*$timers*/ ctx[3][2].name },
    			$$inline: true
    		});

    	timersection2.$on("selected", function () {
    		if (is_function(/*onSelected*/ ctx[0])) /*onSelected*/ ctx[0].apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p = element("p");
    			t0 = text("Loops: ");
    			t1 = text(/*$loops*/ ctx[1]);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = space();
    			hr0 = element("hr");
    			t5 = space();
    			div1 = element("div");
    			create_component(timersection0.$$.fragment);
    			t6 = space();
    			create_component(timersection1.$$.fragment);
    			t7 = space();
    			create_component(timersection2.$$.fragment);
    			t8 = space();
    			hr1 = element("hr");
    			attr_dev(p, "class", "svelte-1y2wuwu");
    			add_location(p, file$7, 13, 2, 237);
    			attr_dev(hr0, "class", "svelte-1y2wuwu");
    			add_location(hr0, file$7, 14, 2, 294);
    			attr_dev(div0, "class", "LoopLine svelte-1y2wuwu");
    			add_location(div0, file$7, 12, 0, 211);
    			attr_dev(div1, "class", "TimerSections svelte-1y2wuwu");
    			add_location(div1, file$7, 17, 0, 310);
    			add_location(hr1, file$7, 23, 0, 553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(div0, t4);
    			append_dev(div0, hr0);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(timersection0, div1, null);
    			append_dev(div1, t6);
    			mount_component(timersection1, div1, null);
    			append_dev(div1, t7);
    			mount_component(timersection2, div1, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, hr1, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (!current || dirty & /*$loops*/ 2) set_data_dev(t1, /*$loops*/ ctx[1]);
    			if ((!current || dirty & /*$userSettings*/ 4) && t3_value !== (t3_value = /*$userSettings*/ ctx[2].focusRestLoops + "")) set_data_dev(t3, t3_value);
    			const timersection0_changes = {};
    			if (dirty & /*$timers*/ 8) timersection0_changes.name = /*$timers*/ ctx[3][0].name;
    			timersection0.$set(timersection0_changes);
    			const timersection1_changes = {};
    			if (dirty & /*$timers*/ 8) timersection1_changes.name = /*$timers*/ ctx[3][1].name;
    			timersection1.$set(timersection1_changes);
    			const timersection2_changes = {};
    			if (dirty & /*$timers*/ 8) timersection2_changes.name = /*$timers*/ ctx[3][2].name;
    			timersection2.$set(timersection2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timersection0.$$.fragment, local);
    			transition_in(timersection1.$$.fragment, local);
    			transition_in(timersection2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timersection0.$$.fragment, local);
    			transition_out(timersection1.$$.fragment, local);
    			transition_out(timersection2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			destroy_component(timersection0);
    			destroy_component(timersection1);
    			destroy_component(timersection2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(hr1);
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
    	let $loops;
    	let $userSettings;
    	let $timers;
    	validate_store(loops, 'loops');
    	component_subscribe($$self, loops, $$value => $$invalidate(1, $loops = $$value));
    	validate_store(userSettings, 'userSettings');
    	component_subscribe($$self, userSettings, $$value => $$invalidate(2, $userSettings = $$value));
    	validate_store(timers, 'timers');
    	component_subscribe($$self, timers, $$value => $$invalidate(3, $timers = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LoopsSection', slots, []);
    	let { onSelected } = $$props;
    	const writable_props = ['onSelected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoopsSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onSelected' in $$props) $$invalidate(0, onSelected = $$props.onSelected);
    	};

    	$$self.$capture_state = () => ({
    		TimerSection,
    		loops,
    		userSettings,
    		timers,
    		onSelected,
    		$loops,
    		$userSettings,
    		$timers
    	});

    	$$self.$inject_state = $$props => {
    		if ('onSelected' in $$props) $$invalidate(0, onSelected = $$props.onSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onSelected, $loops, $userSettings, $timers];
    }

    class LoopsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { onSelected: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoopsSection",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onSelected*/ ctx[0] === undefined && !('onSelected' in props)) {
    			console.warn("<LoopsSection> was created without expected prop 'onSelected'");
    		}
    	}

    	get onSelected() {
    		throw new Error("<LoopsSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSelected(value) {
    		throw new Error("<LoopsSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Prefabs\Button.svelte generated by Svelte v3.44.2 */

    const file$6 = "src\\Components\\Prefabs\\Button.svelte";

    // (6:48) Button text
    function fallback_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Button text");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(6:48) Button text",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(button, "class", "button svelte-fiiwvt");
    			add_location(button, file$6, 5, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
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
    	validate_slots('Button', slots, ['default']);
    	let { onClick } = $$props;
    	const writable_props = ['onClick'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ onClick });

    	$$self.$inject_state = $$props => {
    		if ('onClick' in $$props) $$invalidate(0, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [onClick, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { onClick: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*onClick*/ ctx[0] === undefined && !('onClick' in props)) {
    			console.warn("<Button> was created without expected prop 'onClick'");
    		}
    	}

    	get onClick() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Prefabs\ControlsSection.svelte generated by Svelte v3.44.2 */
    const file$5 = "src\\Components\\Prefabs\\ControlsSection.svelte";

    // (17:33) 
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Pause");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(17:33) ",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if runningState === 0 || runningState === 2}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(15:4) {#if runningState === 0 || runningState === 2}",
    		ctx
    	});

    	return block;
    }

    // (14:2) <Button onClick={buttonClicked}>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*runningState*/ ctx[1] === 0 || /*runningState*/ ctx[1] === 2) return create_if_block;
    		if (/*runningState*/ ctx[1] === 1) return create_if_block_1;
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
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
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
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(14:2) <Button onClick={buttonClicked}>",
    		ctx
    	});

    	return block;
    }

    // (22:2) <Button onClick={stopTimer}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(22:2) <Button onClick={stopTimer}>",
    		ctx
    	});

    	return block;
    }

    // (26:2) <Button onClick={onSkip}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Skip");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(26:2) <Button onClick={onSkip}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div0;
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let div1;
    	let button2;
    	let current;

    	button0 = new Button({
    			props: {
    				onClick: /*buttonClicked*/ ctx[0],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				onClick: /*stopTimer*/ ctx[2],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				onClick: /*onSkip*/ ctx[3],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(button2.$$.fragment);
    			add_location(div0, file$5, 11, 0, 195);
    			add_location(div1, file$5, 24, 0, 435);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(button0, div0, null);
    			append_dev(div0, t0);
    			mount_component(button1, div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(button2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};
    			if (dirty & /*buttonClicked*/ 1) button0_changes.onClick = /*buttonClicked*/ ctx[0];

    			if (dirty & /*$$scope, runningState*/ 18) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*stopTimer*/ 4) button1_changes.onClick = /*stopTimer*/ ctx[2];

    			if (dirty & /*$$scope*/ 16) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*onSkip*/ 8) button2_changes.onClick = /*onSkip*/ ctx[3];

    			if (dirty & /*$$scope*/ 16) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(button0);
    			destroy_component(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(button2);
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
    	validate_slots('ControlsSection', slots, []);

    	let { buttonClicked = () => {
    		
    	} } = $$props;

    	let { runningState = 0 } = $$props;
    	let { stopTimer = 0 } = $$props;
    	let { onSkip = 0 } = $$props;
    	const writable_props = ['buttonClicked', 'runningState', 'stopTimer', 'onSkip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ControlsSection> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('buttonClicked' in $$props) $$invalidate(0, buttonClicked = $$props.buttonClicked);
    		if ('runningState' in $$props) $$invalidate(1, runningState = $$props.runningState);
    		if ('stopTimer' in $$props) $$invalidate(2, stopTimer = $$props.stopTimer);
    		if ('onSkip' in $$props) $$invalidate(3, onSkip = $$props.onSkip);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		buttonClicked,
    		runningState,
    		stopTimer,
    		onSkip
    	});

    	$$self.$inject_state = $$props => {
    		if ('buttonClicked' in $$props) $$invalidate(0, buttonClicked = $$props.buttonClicked);
    		if ('runningState' in $$props) $$invalidate(1, runningState = $$props.runningState);
    		if ('stopTimer' in $$props) $$invalidate(2, stopTimer = $$props.stopTimer);
    		if ('onSkip' in $$props) $$invalidate(3, onSkip = $$props.onSkip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [buttonClicked, runningState, stopTimer, onSkip];
    }

    class ControlsSection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			buttonClicked: 0,
    			runningState: 1,
    			stopTimer: 2,
    			onSkip: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlsSection",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get buttonClicked() {
    		throw new Error("<ControlsSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonClicked(value) {
    		throw new Error("<ControlsSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get runningState() {
    		throw new Error("<ControlsSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set runningState(value) {
    		throw new Error("<ControlsSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stopTimer() {
    		throw new Error("<ControlsSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stopTimer(value) {
    		throw new Error("<ControlsSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSkip() {
    		throw new Error("<ControlsSection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSkip(value) {
    		throw new Error("<ControlsSection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Prefabs\RotatingIcon.svelte generated by Svelte v3.44.2 */

    const file$4 = "src\\Components\\Prefabs\\RotatingIcon.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t = text("🍅");
    			attr_dev(h1, "style", /*rotation*/ ctx[0]);
    			attr_dev(h1, "class", "icon");
    			add_location(h1, file$4, 5, 2, 60);
    			add_location(div, file$4, 4, 0, 51);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rotation*/ 1) {
    				attr_dev(h1, "style", /*rotation*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	validate_slots('RotatingIcon', slots, []);
    	let { rotation = 0 } = $$props;
    	const writable_props = ['rotation'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RotatingIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('rotation' in $$props) $$invalidate(0, rotation = $$props.rotation);
    	};

    	$$self.$capture_state = () => ({ rotation });

    	$$self.$inject_state = $$props => {
    		if ('rotation' in $$props) $$invalidate(0, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [rotation];
    }

    class RotatingIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { rotation: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RotatingIcon",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get rotation() {
    		throw new Error("<RotatingIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotation(value) {
    		throw new Error("<RotatingIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Prefabs\Switch.svelte generated by Svelte v3.44.2 */

    const file$3 = "src\\Components\\Prefabs\\Switch.svelte";

    function create_fragment$3(ctx) {
    	let label;
    	let input;
    	let t;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-kxv4e0");
    			add_location(input, file$3, 60, 2, 1062);
    			attr_dev(span, "class", "slider svelte-kxv4e0");
    			add_location(span, file$3, 61, 2, 1104);
    			attr_dev(label, "class", "switch svelte-kxv4e0");
    			add_location(label, file$3, 59, 0, 1036);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, span);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { checked = false } = $$props;
    	const writable_props = ['checked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ checked });

    	$$self.$inject_state = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, input_change_handler];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Settings.svelte generated by Svelte v3.44.2 */
    const file$2 = "src\\Components\\Settings.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let dl;
    	let dt0;
    	let dd0;
    	let switch0;
    	let updating_checked;
    	let dt1;
    	let dd1;
    	let switch1;
    	let updating_checked_1;
    	let dt2;
    	let dd2;
    	let switch2;
    	let updating_checked_2;
    	let dt3;
    	let dd3;
    	let input;
    	let current;
    	let mounted;
    	let dispose;

    	function switch0_checked_binding(value) {
    		/*switch0_checked_binding*/ ctx[1](value);
    	}

    	let switch0_props = {};

    	if (/*$userSettings*/ ctx[0].autoIncrementTimer !== void 0) {
    		switch0_props.checked = /*$userSettings*/ ctx[0].autoIncrementTimer;
    	}

    	switch0 = new Switch({ props: switch0_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch0, 'checked', switch0_checked_binding));

    	function switch1_checked_binding(value) {
    		/*switch1_checked_binding*/ ctx[2](value);
    	}

    	let switch1_props = {};

    	if (/*$userSettings*/ ctx[0].pauseBetweenTimers !== void 0) {
    		switch1_props.checked = /*$userSettings*/ ctx[0].pauseBetweenTimers;
    	}

    	switch1 = new Switch({ props: switch1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch1, 'checked', switch1_checked_binding));

    	function switch2_checked_binding(value) {
    		/*switch2_checked_binding*/ ctx[3](value);
    	}

    	let switch2_props = {};

    	if (/*$userSettings*/ ctx[0].notificationSound !== void 0) {
    		switch2_props.checked = /*$userSettings*/ ctx[0].notificationSound;
    	}

    	switch2 = new Switch({ props: switch2_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch2, 'checked', switch2_checked_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			dl = element("dl");
    			dt0 = element("dt");
    			dt0.textContent = "Move to the next timer automatically";
    			dd0 = element("dd");
    			create_component(switch0.$$.fragment);
    			dt1 = element("dt");
    			dt1.textContent = "Pause when the next timer starts";
    			dd1 = element("dd");
    			create_component(switch1.$$.fragment);
    			dt2 = element("dt");
    			dt2.textContent = "Browser notification plays sound";
    			dd2 = element("dd");
    			create_component(switch2.$$.fragment);
    			dt3 = element("dt");
    			dt3.textContent = "Focus-Short break loops before long break";
    			dd3 = element("dd");
    			input = element("input");
    			add_location(dt0, file$2, 11, 4, 166);
    			attr_dev(dd0, "class", "svelte-4vpnvq");
    			add_location(dd0, file$2, 13, 4, 265);
    			add_location(dt1, file$2, 15, 4, 340);
    			attr_dev(dd1, "class", "svelte-4vpnvq");
    			add_location(dd1, file$2, 17, 4, 435);
    			add_location(dt2, file$2, 19, 4, 510);
    			attr_dev(dd2, "class", "svelte-4vpnvq");
    			add_location(dd2, file$2, 21, 4, 605);
    			add_location(dt3, file$2, 23, 4, 679);
    			attr_dev(input, "type", "number");
    			add_location(input, file$2, 25, 8, 787);
    			attr_dev(dd3, "class", "svelte-4vpnvq");
    			add_location(dd3, file$2, 25, 4, 783);
    			add_location(dl, file$2, 10, 2, 156);
    			add_location(div, file$2, 9, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, dl);
    			append_dev(dl, dt0);
    			append_dev(dl, dd0);
    			mount_component(switch0, dd0, null);
    			append_dev(dl, dt1);
    			append_dev(dl, dd1);
    			mount_component(switch1, dd1, null);
    			append_dev(dl, dt2);
    			append_dev(dl, dd2);
    			mount_component(switch2, dd2, null);
    			append_dev(dl, dt3);
    			append_dev(dl, dd3);
    			append_dev(dd3, input);
    			set_input_value(input, /*$userSettings*/ ctx[0].focusRestLoops);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const switch0_changes = {};

    			if (!updating_checked && dirty & /*$userSettings*/ 1) {
    				updating_checked = true;
    				switch0_changes.checked = /*$userSettings*/ ctx[0].autoIncrementTimer;
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch0.$set(switch0_changes);
    			const switch1_changes = {};

    			if (!updating_checked_1 && dirty & /*$userSettings*/ 1) {
    				updating_checked_1 = true;
    				switch1_changes.checked = /*$userSettings*/ ctx[0].pauseBetweenTimers;
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			switch1.$set(switch1_changes);
    			const switch2_changes = {};

    			if (!updating_checked_2 && dirty & /*$userSettings*/ 1) {
    				updating_checked_2 = true;
    				switch2_changes.checked = /*$userSettings*/ ctx[0].notificationSound;
    				add_flush_callback(() => updating_checked_2 = false);
    			}

    			switch2.$set(switch2_changes);

    			if (dirty & /*$userSettings*/ 1 && to_number(input.value) !== /*$userSettings*/ ctx[0].focusRestLoops) {
    				set_input_value(input, /*$userSettings*/ ctx[0].focusRestLoops);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(switch0.$$.fragment, local);
    			transition_in(switch1.$$.fragment, local);
    			transition_in(switch2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(switch0.$$.fragment, local);
    			transition_out(switch1.$$.fragment, local);
    			transition_out(switch2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(switch0);
    			destroy_component(switch1);
    			destroy_component(switch2);
    			mounted = false;
    			dispose();
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $userSettings;
    	validate_store(userSettings, 'userSettings');
    	component_subscribe($$self, userSettings, $$value => $$invalidate(0, $userSettings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	function switch0_checked_binding(value) {
    		if ($$self.$$.not_equal($userSettings.autoIncrementTimer, value)) {
    			$userSettings.autoIncrementTimer = value;
    			userSettings.set($userSettings);
    		}
    	}

    	function switch1_checked_binding(value) {
    		if ($$self.$$.not_equal($userSettings.pauseBetweenTimers, value)) {
    			$userSettings.pauseBetweenTimers = value;
    			userSettings.set($userSettings);
    		}
    	}

    	function switch2_checked_binding(value) {
    		if ($$self.$$.not_equal($userSettings.notificationSound, value)) {
    			$userSettings.notificationSound = value;
    			userSettings.set($userSettings);
    		}
    	}

    	function input_input_handler() {
    		$userSettings.focusRestLoops = to_number(this.value);
    		userSettings.set($userSettings);
    	}

    	$$self.$capture_state = () => ({ Switch, userSettings, $userSettings });

    	return [
    		$userSettings,
    		switch0_checked_binding,
    		switch1_checked_binding,
    		switch2_checked_binding,
    		input_input_handler
    	];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Components\Main.svelte generated by Svelte v3.44.2 */

    const file$1 = "src\\Components\\Main.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let rotatingicon;
    	let t0;
    	let div0;
    	let h2;
    	let t1;
    	let t2;
    	let controlssection;
    	let t3;
    	let loopssection;
    	let t4;
    	let settings;
    	let current;

    	rotatingicon = new RotatingIcon({
    			props: { rotation: /*rotation*/ ctx[2] },
    			$$inline: true
    		});

    	controlssection = new ControlsSection({
    			props: {
    				runningState: /*runningState*/ ctx[0],
    				buttonClicked: /*buttonClicked*/ ctx[3],
    				stopTimer: /*stopTimer*/ ctx[4],
    				onSkip: /*onSkip*/ ctx[6]
    			},
    			$$inline: true
    		});

    	loopssection = new LoopsSection({
    			props: { onSelected: /*onSelected*/ ctx[5] },
    			$$inline: true
    		});

    	settings = new Settings({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			create_component(rotatingicon.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t1 = text(/*remainingTimeFormatted*/ ctx[1]);
    			t2 = space();
    			create_component(controlssection.$$.fragment);
    			t3 = space();
    			create_component(loopssection.$$.fragment);
    			t4 = space();
    			create_component(settings.$$.fragment);
    			add_location(h2, file$1, 165, 6, 4735);
    			add_location(div0, file$1, 164, 4, 4722);
    			attr_dev(div1, "class", "innerWrapper svelte-4kanhl");
    			add_location(div1, file$1, 160, 2, 4653);
    			attr_dev(div2, "class", "outerWrapper svelte-4kanhl");
    			add_location(div2, file$1, 159, 0, 4623);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(rotatingicon, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div1, t2);
    			mount_component(controlssection, div1, null);
    			append_dev(div1, t3);
    			mount_component(loopssection, div1, null);
    			append_dev(div1, t4);
    			mount_component(settings, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const rotatingicon_changes = {};
    			if (dirty & /*rotation*/ 4) rotatingicon_changes.rotation = /*rotation*/ ctx[2];
    			rotatingicon.$set(rotatingicon_changes);
    			if (!current || dirty & /*remainingTimeFormatted*/ 2) set_data_dev(t1, /*remainingTimeFormatted*/ ctx[1]);
    			const controlssection_changes = {};
    			if (dirty & /*runningState*/ 1) controlssection_changes.runningState = /*runningState*/ ctx[0];
    			controlssection.$set(controlssection_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rotatingicon.$$.fragment, local);
    			transition_in(controlssection.$$.fragment, local);
    			transition_in(loopssection.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rotatingicon.$$.fragment, local);
    			transition_out(controlssection.$$.fragment, local);
    			transition_out(loopssection.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(rotatingicon);
    			destroy_component(controlssection);
    			destroy_component(loopssection);
    			destroy_component(settings);
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

    const SECOND_INTERVAL = 1000;

    function instance$1($$self, $$props, $$invalidate) {
    	let rotation;
    	let $activeTimerName;
    	let $activeRunTime;
    	let $userSettings;
    	let $timers;
    	let $loops;
    	validate_store(activeTimerName, 'activeTimerName');
    	component_subscribe($$self, activeTimerName, $$value => $$invalidate(7, $activeTimerName = $$value));
    	validate_store(activeRunTime, 'activeRunTime');
    	component_subscribe($$self, activeRunTime, $$value => $$invalidate(8, $activeRunTime = $$value));
    	validate_store(userSettings, 'userSettings');
    	component_subscribe($$self, userSettings, $$value => $$invalidate(10, $userSettings = $$value));
    	validate_store(timers, 'timers');
    	component_subscribe($$self, timers, $$value => $$invalidate(11, $timers = $$value));
    	validate_store(loops, 'loops');
    	component_subscribe($$self, loops, $$value => $$invalidate(12, $loops = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let runningState = 0; // 0 stopped, 1 running, 2 paused
    	let remainingTimeFormatted = "00:00";
    	let timerIntervalId = false;

    	const getTimerByName = timerName => {
    		let found = false;

    		$timers.some(timer => {
    			found = timer.name === timerName ? timer : false;
    			return found;
    		});

    		return found;
    	};

    	const timerChange = (change = null) => {
    		// collect names
    		let names = [];

    		$timers.forEach(t => names.push(t.name));
    		let newTimerName = "";

    		// if we're setting directly
    		if (typeof change === "string" && names.includes(change)) {
    			newTimerName = change;
    		} else if (typeof change === "number") {
    			// if at or above focusRestLoops, allow move onto the next
    			let modulo = $loops >= $userSettings.focusRestLoops
    			? names.length
    			: 2; // if we're incrementing

    			var newIndex = names.indexOf($activeTimerName) + change;
    			newIndex = (newIndex < 0 ? names.length - 1 : newIndex) % modulo;
    			newTimerName = $timers[newIndex].name;
    			if (newIndex === 0) loops.set($loops + 1);
    		}

    		activeRunTime.set(0);
    		activeTimerName.set(newTimerName);
    	};

    	// update the display time
    	const updateDisplayTime = (_timers, _activeRunTime) => {
    		_timers.some(t => {
    			if (t.name === $activeTimerName) {
    				let remainingMilliseconds = Math.max(0, t.length - _activeRunTime);
    				$$invalidate(1, remainingTimeFormatted = msToMinutesSeconds(remainingMilliseconds));
    			}
    		});
    	};

    	// if a timer changes
    	timers.subscribe(dTimers => {
    		updateDisplayTime(dTimers, $activeRunTime);
    	});

    	// if the run time changes
    	activeRunTime.subscribe(dActiveRunTime => {
    		updateDisplayTime($timers, dActiveRunTime);
    	});

    	// if the selected timer is set
    	activeTimerName.subscribe(dActiveTimerName => {
    		updateDisplayTime($timers, $activeRunTime);
    	});

    	// set initial
    	updateDisplayTime($timers, $activeRunTime);

    	// handle the start / pause button
    	const buttonClicked = () => {
    		if (runningState === 0 || // stopped
    		runningState === 2) {
    			startTimer(); // paused
    		} else if (runningState === 1) {
    			// running
    			pauseTimer();
    		}
    	};

    	/**
     * ==================== timer controls
     */
    	const startTimer = () => {
    		clearInterval(timerIntervalId);

    		timerIntervalId = setInterval(
    			() => {
    				activeRunTime.update(v => v += 1000);

    				if (hasTimerExpired()) {
    					let text = `Time for ${$activeTimerName} has ended.`;
    					sendNotification(text, $userSettings.notificationSound);
    					$userSettings.pauseBetweenTimers && pauseTimer();
    					$userSettings.autoIncrementTimer && timerChange(+1);
    				}
    			},
    			SECOND_INTERVAL
    		);

    		$$invalidate(0, runningState = 1);
    	};

    	const pauseTimer = () => {
    		clearInterval(timerIntervalId);
    		$$invalidate(0, runningState = 2);
    	};

    	const stopTimer = () => {
    		clearInterval(timerIntervalId);
    		$$invalidate(0, runningState = 0); // set stopped
    		activeRunTime.set(0); // reset running time
    		activeTimerName.set("focus"); // reset back to default timer
    	};

    	// true if the active run time is longer than active timer's length
    	const hasTimerExpired = () => {
    		return $activeRunTime >= getTimerByName($activeTimerName).length;
    	};

    	// when a TimerOptions is selected as the new timer
    	const onSelected = event => {
    		activeTimerName.set(event.detail.name);
    	};

    	const onSkip = () => {
    		// slipping should _always_ reset the active run time
    		activeRunTime.set(0);

    		// but it should optionally clear the running interval
    		if ($userSettings.pauseBetweenTimers) {
    			clearInterval(timerIntervalId);
    			$$invalidate(0, runningState = 0); // set stopped
    		}

    		timerChange(+1);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		LoopsSection,
    		ControlsSection,
    		RotatingIcon,
    		Settings,
    		msToMinutesSeconds,
    		sendNotification,
    		timers,
    		activeTimerName,
    		activeRunTime,
    		loops,
    		userSettings,
    		runningState,
    		remainingTimeFormatted,
    		timerIntervalId,
    		SECOND_INTERVAL,
    		getTimerByName,
    		timerChange,
    		updateDisplayTime,
    		buttonClicked,
    		startTimer,
    		pauseTimer,
    		stopTimer,
    		hasTimerExpired,
    		onSelected,
    		onSkip,
    		rotation,
    		$activeTimerName,
    		$activeRunTime,
    		$userSettings,
    		$timers,
    		$loops
    	});

    	$$self.$inject_state = $$props => {
    		if ('runningState' in $$props) $$invalidate(0, runningState = $$props.runningState);
    		if ('remainingTimeFormatted' in $$props) $$invalidate(1, remainingTimeFormatted = $$props.remainingTimeFormatted);
    		if ('timerIntervalId' in $$props) timerIntervalId = $$props.timerIntervalId;
    		if ('rotation' in $$props) $$invalidate(2, rotation = $$props.rotation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRunTime, $activeTimerName*/ 384) {
    			$$invalidate(2, rotation = `transform: rotate(${$activeRunTime / getTimerByName($activeTimerName).length * 360}deg);`);
    		}
    	};

    	return [
    		runningState,
    		remainingTimeFormatted,
    		rotation,
    		buttonClicked,
    		stopTimer,
    		onSelected,
    		onSkip,
    		$activeTimerName,
    		$activeRunTime
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main1;
    	let main0;
    	let current;
    	main0 = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			main1 = element("main");
    			create_component(main0.$$.fragment);
    			attr_dev(main1, "class", "svelte-1h6otfa");
    			add_location(main1, file, 5, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main1, anchor);
    			mount_component(main0, main1, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main0.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main0.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main1);
    			destroy_component(main0);
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
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Main });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
