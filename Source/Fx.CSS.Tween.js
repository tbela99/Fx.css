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
!function () {
"use strict";

Fx.Tween.implement(Object.append({

	start: function(property, from, to) {

		var args = Array.flatten(Array.slice(arguments)), parsed;

		property = this.options.property || args.shift();

		if (!this.check(property, from, to)) return this;

		//console.log(
		this.css = !this.locked && typeof this.options.transition == 'string' && Fx.css3Transition && Fx.transitionTimings[this.options.transition]
					&& property != 'transform';

		this.property = property;

		parsed = this.prepare(this.element, property, args);

		if(this.css) {

			//console.log(JSON.encode([from, to]));
			this.running = true;
			to = Array.flatten(Array.from(parsed.to))[0];
			from = Array.flatten(Array.from(parsed.from))[0];

			from = from.parser.serve(from.value);
			to = to.parser.serve(to.value);

			if(args[1]) this.element.setStyle('transition', '').setStyle(property, from);

			this.element.addEvents(this.events).setStyle('transition', property.hyphenate() + ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').
						setStyle(property, to);

			//console.log([to, from, ['', 'transparent', 'auto', 'none'].indexOf(from)])
			if(from == to || ['', 'transparent', 'auto', 'none'].indexOf(from) != -1) this.onComplete();

			return this
		}

		//chaining css animation && timer leads to unpredictable animation order
		this.locked = true;

		return this.parent(parsed.from, parsed.to);
	}

}, FxCSS))
}();;
