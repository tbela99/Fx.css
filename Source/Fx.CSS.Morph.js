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

		//false
		// console.log('isRunning: ' + this.isRunning() + ' check (should be true): ' + this.check(properties));
		// console.log(properties);
		
		if (!this.check(properties)) return this;
		
		//	console.log('start:isRunning: ' + this.isRunning())

		this.css = !this.locked && typeof this.options.transition == 'string' && Fx.transitionTimings[this.options.transition] && Fx.css3Transition;
					//&& !properties.transform;

		if (typeof properties == 'string') properties = this.search(properties);
		
		var from = {}, to = {};
		
		for (var p in properties){
		
			var parsed = this.prepare(this.element, p, properties[p]);
			
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		
		if(this.css) {

			var transition = this.element.getPrefixed('transition'), 
				className = 'morphtmp' + String.uniqueID(),
				styles = Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }),
				tmp = new Element('div'),
				cssText,
				changed = false;
		
			this.element.setStyle('transition', '').
				setStyles(Object.map(from, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) })).
				addEvents(this.events);
				
			cssText = this.element.style.cssText;
			
			if(Object.every(styles, function (value, key) { 
			
					//console.log()
					return this.element.getStyle(key) == tmp.setStyle(key, value).getStyle(key) 
			
			}, this)) {
			
				console.log('unchanged!'); 
				return this.stop();
			}
				
			var style = this.createStyle(styles, className, transition.hyphenate() + ':all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ');');
			
			//this.element.style[transition] = 'all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ')';
			
			document.head.grab(style);
			
			//check whether styles are changed
			
			// console.log('transitionStart:' + className);
			// console.log('transitionStart:' + className);
			
			this.element /*.addEvent('transitionstart:once', function () {
			
				console.log('transitionstart:' + className)
			}).
			addEvent('animationstart:once', function () {
			
				console.log('animationstart:' + className)
			}).
			addEvent('animationend:once', function () {
			
				console.log('animationend:' + className)
			}) */.addEvent('transitionend:once', function () {
			
					console.log('transitionend:' + className)
					//this.style[transition] = '';
					this.style.cssText = cssText;
					console.log('oldStyle: ' + cssText)
					this.setStyles(styles).removeClass(className)
					console.log('newStyle: ' + this.style.cssText)
					document.head.removeChild(style);
					
			}).addClass(className);

			return this//.parent(from, to);
		}

		return this.parent(from, to);
	}
	
}, FxCSS))
}();
