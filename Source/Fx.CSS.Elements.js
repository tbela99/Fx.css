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
more/1.3:
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
			this.events = {transitionend: this.stop}
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

				this.completed = 0;
				
				for(i in from) {

					this.elements[i].setStyle('transition', '').
									setStyles(Object.map(from[i], function (value, property) {

										value = Array.flatten(Array.from(value))[0];

										return value.parser.serve(value.value)

									})).
									setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')').
									addEvents(this.events);

					styles[i] = Object.map(to[i], function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) })
				}
				
				for(i in styles) this.elements[i].setStyles(styles[i]);

				return this
			}

			return this.parent(from, to);
		},

		stop: function () {

			if(this.css) {

				this.completed++;

				if(this.completed < this.elements.length) return this;

				this.css = false;
				this.elements.each(function (el) { el.removeEvents(this.events).setStyle('transition', '') }, this);
				this.fireEvent('complete', this.subject);
								
				if(!this.callChain()) this.fireEvent('chainComplete', this.subject);

				return this
			}

			return this.parent()
		}
	}))
	
}();
