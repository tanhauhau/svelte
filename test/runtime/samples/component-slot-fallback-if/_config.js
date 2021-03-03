export default {
	solo: true,
	skip_if_hydrate: true,
	skip_if_ssr: true,
	html: `
		<div>
			bar fallback
		</div>
	`,
	async test({ assert, component, target }) {
		component.condition = true;
		assert.htmlEqual(target.innerHTML, '')
	}
};
