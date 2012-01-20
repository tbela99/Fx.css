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

//this is for debugging only
Fx.Morph.implement({check: function(){
		if (!this.isRunning()) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': console.log('chaining ', arguments); this.chain(this.caller.pass(arguments, this)); return false;
		}
		return false;
	}
});
//
	
!function () {

"use strict";

Fx.Morph.implement(Object.append({

	start: function(properties) {

		//false
		console.log('start: isRunning: ' + this.isRunning(), properties);
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
				fromClassName = 'morphftmp' + String.uniqueID(),
				toClassName = 'morphttmp' + String.uniqueID(),
				styles = Object.map(to, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }),
				tmp = new Element('div');
				
			this.element.setStyle('transition', '').
				setStyles(Object.map(from, function (value) { value = Array.from(value)[0]; return value.parser.serve(value.value) }));
				
			tmp.cssText = this.element.cssText;
			tmp.setStyles(styles);
			
			//we need to clear element styles and use css only from - to
			var style = this.createStyle(this.element.style.cssText + transition.hyphenate() + ':all ' + this.options.duration + 'ms cubic-bezier(' + Fx.transitionTimings[this.options.transition] + ');', tmp.style.cssText, fromClassName, toClassName);
			
			document.head.grab(style);
			
			this.element.addClass(fromClassName).style.cssText = '';
			
			//console.log('this.element.style.cssText: ' + this.element.style.cssText)
			
					//console.log('link: ' + this.options.link)
			this.element.addEvent('transitionend:once', function () {
			
					console.log('transitionend:' + fromClassName + ' ' + toClassName)
					//this.style[transition] = '';
					this.style.cssText = tmp.style.cssText;
					//console.log('oldStyle: ' + cssText);
					this.removeClass(fromClassName).removeClass(toClassName);
					
					//check whether setting transform keep the value
					//console.log(this.getStyle('transform'), styles)
					//console.log('newStyle: ' + this.style.cssText)
					console.log(style)
					document.head.removeChild(style);
					
			}).addEvents(this.events).addClass(toClassName);
			

			return this//.parent(from, to);
		}

		return this.parent(from, to);
	}
	
}, FxCSS))
}();
