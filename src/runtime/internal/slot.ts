import { assign } from './utils';

export function create_slot(definition, ctx, $$scope, fn) {
	if (definition) {
		const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
		return definition[0](slot_ctx);
	}
}

export function get_slot_context(definition, ctx, $$scope, fn) {
	return definition[1] && fn
		? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
		: $$scope.ctx;
}

export function get_slot_changes(definition, $$scope, dirty, fn) {
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

export function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
	const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
	if (slot_changes) {
		const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
		slot.p(slot_context, slot_changes);
	}
}

export function update_slot_spread(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_spread_changes_fn, get_slot_context_fn) {
	const slot_changes = get_slot_spread_changes_fn(dirty) | get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
	if (slot_changes) {
		const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
		slot.p(slot_context, slot_changes);
	}
}

export function has_slot(slot) {
	console.log('has_slot', slot && (!slot.e || !slot.e()));
  return slot && (!slot.e || !slot.e());
}