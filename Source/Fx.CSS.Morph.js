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

!function () {

"use strict";

Fx.Morph.implement(Object.append({

	start: function(properties) {

		if (!this.check()) return this;

		console.log(properties)
		this.css = !this.locked && typeof this.options.transition == 'string' && Fx.css3Transition && Fx.transitionTimings[this.options.transition];
					//&& !properties.transform;

		if (typeof properties == 'string') properties = this.search(properties);
		
		var from = {}, to = {}, transform = this.element.getPrefixed('transform');
		
		for (var p in properties){
		
			if(p == 'transform' || p.camelCase() == transform) this.css = false;
			
			var parsed = this.prepare(this.element, p, properties[p]);
			
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		
		console.log(properties)
		this.complete = Object.keys(properties).length;
		
		if(this.css) {

			//console.log(properties);
		
			this.running = true;
			this.element.setStyle('transition', '').
				setStyles(Object.map(from, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) })).
				addEvents(this.events).
				setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').
				setStyles(Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }));
				
				//console.log(Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }))
				//console.log(this.element.getStyle('transition'))
				//console.log(props.join() + ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')')
				//console.log(props)
				// console.log(Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }))

			return this
		}

		return this.parent(from, to);
	}
	
}, FxCSS))
}();
