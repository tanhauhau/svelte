
import Renderer, { RenderOptions } from '../Renderer';
import { x } from 'code-red';
import { is_text_or_mustach } from './shared/node';
	
export default function(node, renderer: Renderer, _options: RenderOptions) {
	if (node.prev && is_text_or_mustach(node.prev)) {
		renderer.add_string('<!-- -->');
	}

	const snippet = node.expression.node;

	renderer.add_expression(
		node.parent &&
		node.parent.type === 'Element' &&
		node.parent.name === 'style'
			? snippet
			: x`@escape(${snippet})`
	);
}
