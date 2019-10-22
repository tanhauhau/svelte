import {
	SvelteComponentDev,
	add_location,
	append_dev,
	detach_dev,
	dispatch_dev,
	element,
	init,
	insert_dev,
	noop,
	safe_not_equal,
	set_data_dev,
	space,
	text
} from "svelte/internal";

const file = undefined;

function create_fragment(ctx) {
	let h1;
	let t0_fn = ctx => `Hello ${ctx.name}!`;
	let t0_value = t0_fn(ctx);
	let t0;
	let t1;

	const block = {
		c: function create() {
			h1 = element("h1");
			t0 = text(t0_value);
			t1 = space();
			debugger;
			add_location(h1, file, 4, 0, 38);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, h1, anchor);
			append_dev(h1, t0);
			insert_dev(target, t1, anchor);
		},
		p: function update(changed, ctx) {
			if (changed.name && t0_value !== (t0_value = t0_fn(ctx))) set_data_dev(t0, t0_value);
			debugger;
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(h1);
			if (detaching) detach_dev(t1);
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
	let { name } = $$props;
	const writable_props = ["name"];

	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith("$$")) console.warn(`<Component> was created with unknown prop '${key}'`);
	});

	$$self.$set = $$props => {
		if ("name" in $$props) $$invalidate("name", name = $$props.name);
	};

	$$self.$capture_state = () => {
		return { name };
	};

	$$self.$inject_state = $$props => {
		if ("name" in $$props) $$invalidate("name", name = $$props.name);
	};

	return { name };
}

class Component extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Component",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || ({});

		if (ctx.name === undefined && !("name" in props)) {
			console.warn("<Component> was created without expected prop 'name'");
		}
	}

	get name() {
		throw new Error("<Component>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set name(value) {
		throw new Error("<Component>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export default Component;