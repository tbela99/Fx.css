/*
---
description: native css animations with morph and tween, support of the css3 transform rule.

license: MIT-style

authors:
- Thierry Bela


requires:
Fx.CSS:
- Fx.CSS
core/1.4:
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

		var args = Array.slice(arguments), 
			element = this.element,
			css = ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')',
			parsed;

		property = this.options.property || args.shift();

		if (!this.check(property, from, to)) return this;

		this.css = typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;
		this.property = property;
		
		this.keys = [element.getPrefixed(property)];

		parsed = this.prepare(element, property, args);

		if(this.css) {

			to = Array.flatten(Array.from(parsed.to))[0];
			from = Array.flatten(Array.from(parsed.from))[0];

			from = from.parser.serve(from.value);
			to = to.parser.serve(to.value);
			
			element.setStyle('transition', 'none');
			if(args[1] != undefined) element.setStyle(property, from);

			element.setStyle('transition', this.keys.map(function (prop) { return element.getPrefixed(prop).hyphenate() + css }).join()).
							addEvent('transitionend', this.transitionend).
							setStyle(property, to);

			if(from == to || ['', 'transparent', 'auto', 'none'].indexOf(from) != -1) this.stop();

			return this
		}

		return this.parent(parsed.from, parsed.to);
	}

}, FxCSS))
}();
