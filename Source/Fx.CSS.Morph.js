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
- Fx.Morph

provides: none

...
*/

!function () {

"use strict";

Fx.Morph.implement(Object.append({

	start: function(properties) {

		if (!this.check(properties)) return this;
		
		this.css = typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;

		if (typeof properties == 'string') properties = this.search(properties);
		
		var from = {}, to = {};
		
		for (var p in properties){
		
			var parsed = this.prepare(this.element, p, properties[p]);
			
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		
		if(this.css) {

			var transition = this.element.getPrefixed('transition'),
				styles = Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }),
				tmp = new Element('div'),
				//keys,
				element = this.element,
				css = ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')';
				
			this.element.setStyle(transition, 'none').
				setStyles(Object.map(from, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }));
				
			tmp.cssText = this.element.cssText;
			tmp.setStyles(styles);
			
			this.keys = Object.keys(styles).map(function(style) {
			
				return element.getPrefixed(style)
			}).
			//check if styles are unchanged
			filter(function (style) {
			
				//element.style.borderRadius is an empty string in webkit, this will not work
				if(style == 'borderRadius') {
				
					return !(tmp.style['borderTopLeftRadius'] == element.style['borderTopLeftRadius'] &&
								tmp.style['borderTopRightRadius'] == element.style['borderTopRightRadius'] &&
								tmp.style['borderBottomRightRadius'] == element.style['borderBottomRightRadius'] &&
								tmp.style['borderBottomLeftRadius'] == element.style['borderBottomLeftRadius']);
				}
				
				return !(tmp.style[style] == element.style[style]);
				
			});

			if(this.keys.length == 0) return this.stop();
			
			element.addEvent('transitionend', this.transitionend).
			setStyle(transition, this.keys.map(function (prop) { return element.getPrefixed(prop).hyphenate() + css }).join());
			
			element.setStyles(styles);
			
			return this
		}

		return this.parent(from, to);
	}
	
}, FxCSS))
}();
