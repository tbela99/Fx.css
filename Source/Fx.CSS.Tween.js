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
- Fx.Tween

provides: none

...
*/
!function (undefined) {
"use strict";

Fx.Tween.implement(Object.append({

	start: function(property, from, to) {

		var args = Array.flatten(Array.slice(arguments)), parsed;

		property = this.options.property || args.shift();

		if (!this.check(property, from, to)) return this;

		this.css = typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;
		this.property = property;

		parsed = this.prepare(this.element, property, args);

		if(this.css) {

			to = Array.flatten(Array.from(parsed.to))[0];
			from = Array.flatten(Array.from(parsed.from))[0];

			from = from.parser.serve(from.value);
			to = to.parser.serve(to.value);

			if(args[1] != undefined) this.element.setStyle('transition', '').setStyle(property, from);

			this.element.setStyle('transition', this.element.getPrefixed(property).hyphenate() + ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').
						addEvents(this.events).
						setStyle(property, to);

			if(from == to || ['', 'transparent', 'auto', 'none'].indexOf(from) != -1) this.stop();

			return this
		}

		return this.parent(parsed.from, parsed.to);
	}

}, FxCSS))
}();
