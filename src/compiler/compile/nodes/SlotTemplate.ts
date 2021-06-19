import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import Node from './shared/Node';
import Let from './Let';
import Attribute from './Attribute';
import { INode } from './interfaces';
import get_const_tags from './shared/get_const_tags';
import ConstTag from './ConstTag';

export default class SlotTemplate extends Node {
	type: 'SlotTemplate';
	scope: TemplateScope;
	children: INode[];
	lets: Let[] = [];
	const_tags: ConstTag[];
	slot_attribute: Attribute;
	slot_template_name: string = 'default';

	constructor(
		component: Component,
		parent: INode,
		scope: TemplateScope,
		info: any
	) {
		super(component, parent, scope, info);

		this.validate_slot_template_placement();

		const has_let = info.attributes.some((node) => node.type === 'Let');
		if (has_let) {
			scope = scope.child();
		}

		info.attributes.forEach((node) => {
			switch (node.type) {
				case 'Let': {
					const l = new Let(component, this, scope, node);
					this.lets.push(l);
					const dependencies = new Set([l.name.name]);

					l.names.forEach((name) => {
						scope.add(name, dependencies, this);
					});
					break;
				}
				case 'Attribute': {
					if (node.name === 'slot') {
						this.slot_attribute = new Attribute(component, this, scope, node);
						if (!this.slot_attribute.is_static) {
							component.error(node, {
								code: 'invalid-slot-attribute',
								message: 'slot attribute cannot have a dynamic value'
							});
						}
						const value = this.slot_attribute.get_static_value();
						if (typeof value === 'boolean') {
							component.error(node, {
								code: 'invalid-slot-attribute',
								message: 'slot attribute value is missing'
							});
						}
						this.slot_template_name = value as string;
						break;
					}
					throw new Error(`Invalid attribute '${node.name}' in <svelte:fragment>`);
				}
				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		this.scope = scope;
		([this.const_tags, this.children] = get_const_tags(info.children, component, this, this));
	}

	validate_slot_template_placement() {
		if (this.parent.type !== 'InlineComponent') {
			this.component.error(this, {
				code: 'invalid-slotted-content',
				message: '<svelte:fragment> must be a child of a component'
			});
		}
	}
}
