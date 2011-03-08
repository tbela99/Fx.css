/*
---
description: native css animations with morph and tween, support of the css3 transform rule.

license: MIT-style

authors:
- Thierry Bela

requires:
core/1.3:
- Array
- Element/Element.Style
- Fx/Fx.CSS

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
			this.element.setStyle('transition', 'none');

			Object.each(from, function (value, property) {

				value = Array.flatten(Array.from(value))[0];
				this.element.setStyle(property, value.parser.serve(value.value))

			}, this);

			//console.log('all ' + this.options.duration + 'ms cubic-bezier(' + transitionTimings[this.options.transition] + ')')
			this.element.addEvents(this.events).setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')');

			Object.each(to, function (value, property) {

				value = Array.flatten(Array.from(value))[0];
				this.element.setStyle(property, value.parser.serve(value.value))
			}, this);

			return this
		}

		//chaining css animation && timer leads to unpredictable animation order
		this.locked = true;
		return this.parent(from, to);
	}
}, FxCSS));
