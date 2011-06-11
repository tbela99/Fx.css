/*
---
description: native css animations with Fx.Elements.

license: MIT-style

authors:
- Thierry Bela

requires:
Fx.CSS:
- Fx.CSS
- Stylesheet
core/1.3:
- Array
- Element.Style
more/1.3:
- Fx.Elements

provides: [Fx.CSS.Parsers.Transform]

...
*/

!function () {

	var stylesheet = new Stylesheet(),
		span = new Element('span');

	Fx.Elements.implement(Object.merge({}, FxCSS, {

		initialize: function(elements, options){

			this.elements = this.subject = $$(elements);
			this.parent(Object.merge({transition: 'sine:in:out'}, options));
			this.events = {transitionend: this.onComplete}
		},

		start: function(obj){

			if (!this.check(obj)) return this;

			this.css = !this.locked && typeof this.options.transition == 'string' && Fx.css3Transition && Fx.transitionTimings[this.options.transition];
					//	&& !properties.transform;

			var from = {}, to = {}, classNames = {}, styles = {}, css, style, complete = function () { 
			
				for(var i in classNames) {
				
					stylesheet.removeRule('.' + classNames[i]);
					this.elements[i].setStyles(styles[i]).removeClass(classNames[i]);
				}
				
				this.removeEvent('complete', complete)
			};
			
			for (var i in obj) {
			
				if('transform' in obj[i]) this.css = false;
				var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};

					//console.log([i, this.elements[i]])
				for (var p in iProps){

					var parsed = this.prepare(this.elements[i], p, iProps[p]);
					iFrom[p] = parsed.from;
					iTo[p] = parsed.to;
				}
			}

			if(this.css) {

				this.running = true;
				this.completed = 0;
				
				this.addEvent('complete', complete);
				
				for(i in from) {

					this.elements[i].setStyle('transition', '').
									setStyles(Object.map(from[i], function (value, property) {

										value = Array.flatten(Array.from(value))[0];

										return value.parser.serve(value.value)

									})).
									addEvents(this.events).
									setStyle('transition', 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')');

					css = '';
					styles[i] = Object.map(to[i], function (value, property) {

						value = Array.flatten(Array.from(value))[0];
						
						style = span.setStyle(property, value.parser.serve(value.value)).getStyle(property);
						for(p in styles) css +=  property.hyphenate() + ':' + style + ' !important;';
						return style;
						
					});
					
					classNames[i] = 'clsTmp' + String.uniqueID();
					stylesheet.addRule('.' + classNames[i], css);
					this.elements[i].addClass(classNames[i])
				}

				return this
			}

			this.locked = true;

			return this.parent(from, to);
		},

		onComplete: function () {

			if(this.css && this.running) {

				this.completed++;

				if(this.completed < this.elements.length) return this;

				this.elements.each(function (el) { el.removeEvents(this.events).setStyle('transition', '') }, this);
				this.running = false
			}

			this.css = false;
			this.locked = false;
			return this.parent()
		}
	}))
	
}();
