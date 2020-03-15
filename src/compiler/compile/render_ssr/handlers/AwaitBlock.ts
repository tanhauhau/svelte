import Renderer, { RenderOptions } from '../Renderer';
import AwaitBlock from '../../nodes/AwaitBlock';
import { x } from 'code-red';

export default function(node: AwaitBlock, renderer: Renderer, options: RenderOptions) {
	renderer.push();
	renderer.render(node.pending.children, options);
	const pending = renderer.pop();

	renderer.push();
	renderer.render(node.then.children, options);
	const then = renderer.pop();

	if (options.asyncRendering) {
		renderer.push();
		renderer.render(node.catch.children, options);
		const _catch = renderer.pop();

		renderer.add_expression(x`
			await function(__value) {
				return Promise.resolve(__value)
					.then((${node.value}) => {
						return ${then};
					})
					.catch((${node.error}) => {
						return ${_catch};
					});
			}(${node.expression.node})
		`);
	} else {
		renderer.add_expression(x`
			function(__value) {
				if (@is_promise(__value)) return ${pending};
				return (function(${node.value}) { return ${then}; }(__value));
			}(${node.expression.node})
		`);
	}
}
