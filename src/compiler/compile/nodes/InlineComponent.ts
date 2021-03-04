import Node from './shared/Node';
import Attribute from './Attribute';
import map_children from './shared/map_children';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { INode } from './interfaces';
import { TemplateNode } from '../../interfaces';

export default class InlineComponent extends Node {
	type: 'InlineComponent';
	name: string;
	expression: Expression;
	attributes: Attribute[] = [];
	bindings: Binding[] = [];
	handlers: EventHandler[] = [];
	children: INode[];
	scope: TemplateScope;

	constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode) {
		super(component, parent, scope, info);

		if (info.name !== 'svelte:component' && info.name !== 'svelte:self') {
			const name = info.name.split('.')[0]; // accommodate namespaces
			component.warn_if_undefined(name, info, scope);
			component.add_reference(name);
		}

		this.name = info.name;

		this.expression = this.name === 'svelte:component'
			? new Expression(component, this, scope, info.expression)
			: null;

		const let_attributes = [];
		info.attributes.forEach(node => {
			/* eslint-disable no-fallthrough */
			switch (node.type) {
				case 'Action':
					component.error(node, {
						code: 'invalid-action',
						message: 'Actions can only be applied to DOM elements, not components'
					});

				case 'Attribute':
					// fallthrough
				case 'Spread':
					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					component.error(node, {
						code: 'invalid-class',
						message: 'Classes can only be applied to DOM elements, not components'
					});

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Let':
					let_attributes.push(node);
					break;

				case 'Transition':
					component.error(node, {
						code: 'invalid-transition',
						message: 'Transitions can only be applied to DOM elements, not components'
					});

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
			/* eslint-enable no-fallthrough */
		});

		this.scope = scope;

		this.handlers.forEach(handler => {
			handler.modifiers.forEach(modifier => {
				if (modifier !== 'once') {
					component.error(handler, {
						code: 'invalid-event-modifier',
						message: "Event modifiers other than 'once' can only be used on DOM elements"
					});
				}
			});
		});

		const children = [];
		for (let i=info.children.length - 1; i >= 0; i--) {
			const child = info.children[i];
			if (child.type === 'SlotTemplate') {
				children.push(child);
				info.children.splice(i, 1);
			} else if ((child.type === 'Element' || child.type === 'InlineComponent' || child.type === 'Slot') && child.attributes.find(attribute => attribute.name === 'slot')) {
				const slot_template = {
					start: child.start,
					end: child.end,
					type: 'SlotTemplate',
					name: 'svelte:fragment',
					attributes: [],
					children: [child]
				};

				// transfer attributes
				for (let i=child.attributes.length - 1; i >= 0; i--) {
					const attribute = child.attributes[i];
					if (attribute.type === 'Let') {
						slot_template.attributes.push(attribute);
						child.attributes.splice(i, 1);
					} else if (attribute.type === 'Attribute' && attribute.name === 'slot') {
						slot_template.attributes.push(attribute);
					}
				}
		
				children.push(slot_template);
				info.children.splice(i, 1);
			}
		}

		if (info.children.some(node => not_whitespace_text(node))) {
			children.push({ 
				start: info.start,
				end: info.end,
				type: 'SlotTemplate', 
				name: 'svelte:fragment',
				attributes: [],
				children: info.children
			});
		}

		if (let_attributes.length) {
			let warned = false;
			// copy let: attribute from <Component /> to <svelte:fragment slot="default" />
			// as they are for `slot="default"` only
			children.forEach(child => {
				const slot = child.attributes.find(attribute => attribute.name === 'slot');
				if (!slot || slot.value[0].data === 'default') {
					child.attributes.push(...let_attributes);
				} else if (!warned) {
					component.warn(info, {
						code: 'let-on-component',
						message: 'let: bindings on Component are meant for default slot template only, it is better to define them on <svelte:fragment slot="default"> instead.'
					});
					warned = true;
				}
			});
		}

		this.children = map_children(component, this, this.scope, children);
	}

	get slot_template_name() {
		return this.attributes.find(attribute => attribute.name === 'slot').get_static_value() as string;
	}
}

function not_whitespace_text(node) {
	return !(node.type === 'Text' && /^\s+$/.test(node.data));
}
