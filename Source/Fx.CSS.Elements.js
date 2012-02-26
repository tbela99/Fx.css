/*
---
description: native css animations with Fx.Elements.

license: MIT-style

authors:
- Thierry Bela

requires:
Fx.CSS:
- Fx.CSS
core/1.3:
- Array
- Element.Style
more/1.4:
- Fx.Elements

provides: [Fx.CSS.Parsers.Transform]

...
*/

!function () {
"use strict";

	Fx.Elements.implement(Object.append({}, FxCSS, {

		initialize: function(elements, options){

			this.elements = this.subject = $$(elements);
			this.transitionend = this.transitionend.bind(this);
			this.parent(Object.append({transition: 'sine:in:out'}, options));
		},
		
		transitionend: function (e) {
		
			if(this.checkTransition(e.event.propertyName, this.keys[this.elements.indexOf(e.target)])) {
				
				if(Object.every(this.keys, function (keys) { return keys.length == 0 })) {

					this.subject.removeEvent('transitionend', this.transitionend).setStyle('transition', ''); 
					this.stop()
				}
			}
		},
		start: function(obj){

			if (!this.check(obj)) return this;

			this.css = typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;

			var from = {}, to = {}, styles = {}, parsed, iProps, iFrom, iTo;
			
			for (var i in obj) {
			
				iProps = obj[i];
				iFrom = from[i] = {};
				iTo = to[i] = {};

				for (var p in iProps){

					parsed = this.prepare(this.elements[i], p, iProps[p]);
					iFrom[p] = parsed.from;
					iTo[p] = parsed.to;
				}
			}
			
			if(this.css) {
			
				var css = ' ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')',
					transitions = {},
					tmp = new Element('div');
						
				this.keys = {};
				
				Object.each(from, function (from, i) {
				
					var element = this.elements[i];
					
					element.setStyle('transition', 'none').
						setStyles(Object.map(from, function (value, property) {

							value = Array.flatten(Array.from(value))[0];

							return value.parser.serve(value.value)

						}));
								
					styles[i] = Object.map(to[i], function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) });
					
					tmp.style.cssText = element.style.cssText;
					tmp.setStyles(styles[i]);
					
					//check if styles are identical
					this.keys[i] = Object.keys(styles[i]).filter(function (style) {
					
						style = element.getPrefixed(style);
								
						//element.style.borderRadius is an empty string in webkit, this will not work
						if(style == 'borderRadius') {
						
							return !(tmp.style['borderTopLeftRadius'] == element.style['borderTopLeftRadius'] &&
										tmp.style['borderTopRightRadius'] == element.style['borderTopRightRadius'] &&
										tmp.style['borderBottomRightRadius'] == element.style['borderBottomRightRadius'] &&
										tmp.style['borderBottomLeftRadius'] == element.style['borderBottomLeftRadius']);
						}
						
						return !(tmp.style[style] == element.style[style])
					}).map(function (style) { return element.getPrefixed(style) });
					
					transitions[i] = this.keys[i].map(function (prop) { return element.getPrefixed(prop).hyphenate() + css }).join()

				}, this);
				
				if(Object.every(this.keys, function (keys) { return keys.length == 0 })) return this.stop();
				
				for(i in styles) this.elements[i].setStyle('transition', transitions[i]).addEvent('transitionend', this.transitionend).setStyles(styles[i]);
				
				return this
			}

			return this.parent(from, to);
		}
	}))
	
}();
