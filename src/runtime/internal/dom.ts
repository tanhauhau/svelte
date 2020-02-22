import { has_prop } from "./utils";

export function append(target: Node, node: Node) {
	target.appendChild(node);
}

export function insert(target: Node, node: Node, anchor?: Node) {
	target.insertBefore(node, anchor || null);
}

export function detach(node: Node) {
	node.parentNode.removeChild(node);
}

export function destroy_each(iterations, detaching) {
	for (let i = 0; i < iterations.length; i += 1) {
		if (iterations[i]) iterations[i].d(detaching);
	}
}

export function element<K extends keyof HTMLElementTagNameMap>(name: K) {
	return document.createElement<K>(name);
}

export function element_is<K extends keyof HTMLElementTagNameMap>(name: K, is: string) {
	return document.createElement<K>(name, { is });
}

export function object_without_properties<T, K extends keyof T>(obj: T, exclude: K[]) {
	const target = {} as Pick<T, Exclude<keyof T, K>>;
	for (const k in obj) {
		if (
			has_prop(obj, k)
			// @ts-ignore
			&& exclude.indexOf(k) === -1
		) {
			// @ts-ignore
			target[k] = obj[k];
		}
	}
	return target;
}

export function svg_element<K extends keyof SVGElementTagNameMap>(name: K): SVGElement {
	return document.createElementNS<K>('http://www.w3.org/2000/svg', name);
}

export function text(data: string) {
	return document.createTextNode(data);
}

export function space() {
	return text(' ');
}

export function empty() {
	return text('');
}

export function listen(node: Node, event: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | EventListenerOptions) {
	node.addEventListener(event, handler, options);
	return () => node.removeEventListener(event, handler, options);
}

export function prevent_default(fn) {
	return function(event) {
		event.preventDefault();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function stop_propagation(fn) {
	return function(event) {
		event.stopPropagation();
		// @ts-ignore
		return fn.call(this, event);
	};
}

export function self(fn) {
	return function(event) {
		// @ts-ignore
		if (event.target === this) fn.call(this, event);
	};
}

export function attr(node: Element, attribute: string, value?: string) {
	if (value == null) node.removeAttribute(attribute);
	else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
}

export function set_attributes(node: Element & ElementCSSInlineStyle, attributes: { [x: string]: string }) {
	// @ts-ignore
	const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
	for (const key in attributes) {
		if (attributes[key] == null) {
			node.removeAttribute(key);
		} else if (key === 'style') {
			node.style.cssText = attributes[key];
		} else if (key === '__value' || descriptors[key] && descriptors[key].set) {
			node[key] = attributes[key];
		} else {
			attr(node, key, attributes[key]);
		}
	}
}

export function set_svg_attributes(node: Element & ElementCSSInlineStyle, attributes: { [x: string]: string }) {
	for (const key in attributes) {
		attr(node, key, attributes[key]);
	}
}

export function set_custom_element_data(node, prop, value) {
	if (prop in node) {
		node[prop] = value;
	} else {
		attr(node, prop, value);
	}
}

export function xlink_attr(node, attribute, value) {
	node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}

export function get_binding_group_value(group) {
	const value = [];
	for (let i = 0; i < group.length; i += 1) {
		if (group[i].checked) value.push(group[i].__value);
	}
	return value;
}

export function to_number(value) {
	return value === '' ? undefined : +value;
}

export function time_ranges_to_array(ranges) {
	const array = [];
	for (let i = 0; i < ranges.length; i += 1) {
		array.push({ start: ranges.start(i), end: ranges.end(i) });
	}
	return array;
}

export function children(element) {
	return Array.from(element.childNodes);
}

export function claim_element(nodes, name, attributes, svg) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeName === name) {
			let j = 0;
			while (j < node.attributes.length) {
				const attribute = node.attributes[j];
				if (attributes[attribute.name]) {
					j++;
				} else {
					node.removeAttribute(attribute.name);
				}
			}
			return nodes.splice(i, 1)[0];
		}
	}

	return svg ? svg_element(name) : element(name);
}

export function claim_text(nodes, data) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 3) {
			node.data = '' + data;
			return nodes.splice(i, 1)[0];
		}
	}

	return text(data);
}

export function claim_text_dev(nodes, data) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 3) {
			if (node.textContent !== '' + data) {
				console.warn(`Text content did not match. Server: "${node.textContent}" Client: "${data}"`);
			}
			node.data = '' + data;
			return nodes.splice(i, 1)[0];
		}
	}
	
	console.warn(`Text content did not match. Server: "" Client: "${data}"`);
	return text(data);
}

export function claim_space(nodes) {
	return claim_text(nodes, ' ');
}

function find_comment(nodes, text, start) {
	for (let i = start; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (node.nodeType === 8 /* comment node */ && node.textContent.trim() === text) {
			return i;
		}
	}
	return nodes.length;
}

export function claim_html_tag(html: string, nodes) {
	// find html opening tag
	const start_index = find_comment(nodes, 'HTML_TAG_START', 0);
	const end_index = find_comment(nodes, 'HTML_TAG_END', start_index);
	if (start_index === end_index) {
		return new HtmlTag(html);
	}
	const html_tag_nodes = nodes.splice(start_index, end_index + 1);
	detach(html_tag_nodes[0]);
	detach(html_tag_nodes[html_tag_nodes.length - 1]);
	return new HtmlTag(html_tag_nodes.slice(1, html_tag_nodes.length - 1));
}

export function set_data(text, data) {
	data = '' + data;
	if (text.data !== data) text.data = data;
}

export function set_input_value(input, value) {
	if (value != null || input.value) {
		input.value = value;
	}
}

export function set_input_type(input, type) {
	try {
		input.type = type;
	} catch (e) {
		// do nothing
	}
}

export function set_style(node, key, value, important) {
	node.style.setProperty(key, value, important ? 'important' : '');
}

export function select_option(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];

		if (option.__value === value) {
			option.selected = true;
			return;
		}
	}
}

export function select_options(select, value) {
	for (let i = 0; i < select.options.length; i += 1) {
		const option = select.options[i];
		option.selected = ~value.indexOf(option.__value);
	}
}

export function select_value(select) {
	const selected_option = select.querySelector(':checked') || select.options[0];
	return selected_option && selected_option.__value;
}

export function select_multiple_value(select) {
	return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
}

export function add_resize_listener(element, fn) {
	if (getComputedStyle(element).position === 'static') {
		element.style.position = 'relative';
	}

	const object = document.createElement('object');
	object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
	object.setAttribute('aria-hidden', 'true');
	object.type = 'text/html';
	object.tabIndex = -1;

	let win;

	object.onload = () => {
		win = object.contentDocument.defaultView;
		win.addEventListener('resize', fn);
	};

	if (/Trident/.test(navigator.userAgent)) {
		element.appendChild(object);
		object.data = 'about:blank';
	} else {
		object.data = 'about:blank';
		element.appendChild(object);
	}

	return {
		cancel: () => {
			win && win.removeEventListener && win.removeEventListener('resize', fn);
			element.removeChild(object);
		}
	};
}

export function toggle_class(element, name, toggle) {
	element.classList[toggle ? 'add' : 'remove'](name);
}

export function custom_event<T=any>(type: string, detail?: T) {
	const e: CustomEvent<T> = document.createEvent('CustomEvent');
	e.initCustomEvent(type, false, false, detail);
	return e;
}

export function query_selector_all(selector: string, parent: HTMLElement = document.body) {
	return Array.from(parent.querySelectorAll(selector));
}

export class HtmlTag {
	e: HTMLElement;
	n: ChildNode[];
	t: HTMLElement;
	a: HTMLElement;

	constructor(html: string | ChildNode[]) {
		this.e = element('div');
		if (Array.isArray(html)) {
			this.n = html;
		} else {
			this.u(html);
		}
	}

	b(anchor: HTMLElement = null) {
		this.a = anchor;
	}

	m(target: HTMLElement, anchor: HTMLElement = null) {
		for (let i = 0; i < this.n.length; i += 1) {
			insert(target, this.n[i], anchor);
		}

		this.t = target;
	}

	u(html: string) {
		this.e.innerHTML = html;
		this.n = Array.from(this.e.childNodes);
	}

	p(html: string) {
		this.d();
		this.u(html);
		this.m(this.t, this.a);
	}

	d() {
		this.n.forEach(detach);
	}
}