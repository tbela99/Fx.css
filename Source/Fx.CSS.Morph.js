/*
---
description: native css animations with morph and tween, support of the css3 transform rule.

license: MIT-style

authors:
- Thierry Bela

requires:
Fx.CSS:
- Fx.CSS
core/1.3:
- Array
- Element.Style
- Fx.Morph

provides: none

...
*/

Fx.Morph.implement(Object.merge({

	start: function(properties) {

		if (!this.check(properties)) return this;

		this.css = !this.locked && typeof this.options.transition == 'string' && Fx.css3Transition && Fx.transitionTimings[this.options.transition]
					&& !properties.transform;

		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}

		if(this.css) {

			this.running = true;
			this.element.setStyle('transition', '').
				setStyles(Object.map(from, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) })).
				addEvents(this.events).
				setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').
				setStyles(Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }));

			return this
		}

		//chaining css animation && timer leads to unpredictable animation order
		this.locked = true;
		return this.parent(from, to);
	}
}, FxCSS));
