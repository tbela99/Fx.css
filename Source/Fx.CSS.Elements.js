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
			this.parent(Object.append({transition: 'sine:in:out'}, options));
		},

		start: function(obj){

			if (!this.check(obj)) return this;

			this.css = typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;

			var from = {}, to = {}, styles = {};
			
			for (var i in obj) {
			
				var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};

				for (var p in iProps){

					var parsed = this.prepare(this.elements[i], p, iProps[p]);
					iFrom[p] = parsed.from;
					iTo[p] = parsed.to;
				}
			}
			
			if(this.css) {

				var total = 0, 
						completed = 0,
						transitionend = function (e) {
				
							completed++;
							
							if(completed == total) {

								this.elements.removeEvent('transitionend', transitionend); 
								this.stop()
							}

						}.bind(this);
				
				Object.each(from, function (from, i) {
				
					this.elements[i].setStyle('transition', '').
						setStyles(Object.map(from, function (value, property) {

							value = Array.flatten(Array.from(value))[0];

							return value.parser.serve(value.value)

						}));
									
					styles[i] = Object.map(to[i], function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) });
					
					var tmp = new Element('div'), 
						element = this.elements[i], 
						keys = Object.keys(styles[i]);
					
					tmp.style.cssText = element.style.cssText;
					tmp.setStyles(styles[i]);
					total+= Object.getLength(styles[i]);
					
					//check if styles are identical
					keys.each(function (style) {
					
						style = element.getPrefixed(style);
						
						//element.style.borderRadius is an empty string in webkit
						if((Browser.safari || Browser.chrome || Browser.Platform.ios) && style == 'borderRadius') {
						
							if(tmp.style['borderTopLeftRadius'] == element.style['borderTopLeftRadius'] &&
										tmp.style['borderTopRightRadius'] == element.style['borderTopRightRadius'] &&
										tmp.style['borderBottomRightRadius'] == element.style['borderBottomRightRadius'] &&
										tmp.style['borderBottomLeftRadius'] == element.style['borderBottomLeftRadius']) completed++;
						}
						
						else if(tmp.style[style] == element.style[style]) completed++
						
					})

				}, this);
				
				if(completed == total) return this.stop();
				
				for(i in styles) this.elements[i].setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').addEvent('transitionend', transitionend).setStyles(styles[i]);
					
				return this
			}

			return this.parent(from, to);
		}
	}))
	
}();
