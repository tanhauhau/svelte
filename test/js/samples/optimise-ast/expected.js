import {
	SvelteComponent,
	append,
	append_text,
	detach,
	element,
	init,
	insert,
	listen,
	noop,
	safe_not_equal,
	set_data,
	text
} from "svelte/internal";

function create_fragment(ctx) {
	let button;
	let t1;
	let t3_value = (ctx.count === 1 ? "time" : "times") + "";
	let t3;
	let dispose;

	return {
		c() {
			button = element("button");
			t1 = text(ctx.count);
			t3 = text(t3_value);
			dispose = listen(button, "click", ctx.increment);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append_text(button, "Clicked ");
			append(button, t1);
			append_text(button, " ");
			append(button, t3);
		},
		p(changed, ctx) {
			if (changed.count) set_data(t1, ctx.count);
			if (changed.count && t3_value !== (t3_value = (ctx.count === 1 ? "time" : "times") + "")) set_data(t3, t3_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let count = 0;

	function increment() {
		$$invalidate("count", count = count + 1);
	}

	return { count, increment };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export default Component;