/*
---
description: native css animations.

license: MIT-style

authors:
- Thierry Bela

contributor:
- Andreas Schempp (https://github.com/aschempp)

credits:
- amadeus (CSSEvents)
- André Fiedler, eskimoblood (Fx.Tween.CSS3)

requires:
core/1.4:
- Array
- Element.Style
- Fx.CSS

provides: [FxCSS]

...
*/

!function (context) {
"use strict";

	var div = new Element('div'),
		transition,
		prefix = Browser.safari || Browser.chrome || Browser.Platform.ios ? 'webkit' : (Browser.opera ? 'o' : (Browser.ie ? 'MS' : '')),
		prefixes = ['Khtml','O','Ms','Moz','Webkit'],
		cache = {};
			
	transition = div.getPrefixed('transition');

	//eventTypes
	['transitionEnd' /*, 'transitionStart', 'animationStart', 'animationIteration', 'animationEnd' */].each(function(eventType) {

		Element.NativeEvents[eventType.toLowerCase()] = 2;

		var customType = eventType;
		
		if (prefix) customType = prefix + customType.capitalize();
		else customType = customType.toLowerCase();

		Element.NativeEvents[customType] = 2;
		Element.Events[eventType.toLowerCase()] = {base: customType }
	});
	
	//detect if transition property is supported
	Fx.css3Transition = (function (prop) {
	
		//
		if(prop in div.style) return true;
		
		var prefixes = ['Khtml','O','ms','Moz','Webkit'], i = prefixes.length, upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		while(i--) if(prefixes[i] + upper in div.style) return true;
				
		return false
	})(transition);
	
	Fx.transitionTimings = {
		'ease': '.25,.1,.25,1',
		'ease:in': '.42,0,1,1',
		'ease:out': '0,0,.58,1',
		'ease:in:out': '.42,0,.58,1',
		'linear'		: '0,0,1,1',
		'expo:in'		: '.71,.01,.83,0',
		'expo:out'		: '.14,1,.32,.99',
		'expo:in:out'	: '.85,0,.15,1',
		'circ:in'		: '.34,0,.96,.23',
		'circ:out'		: '0,.5,.37,.98',
		'circ:in:out'	: '.88,.1,.12,.9',
		'sine:in'		: '.22,.04,.36,0',
		'sine:out'		: '.04,0,.5,1',
		'sine:in:out'	: '.37,.01,.63,1',
		'quad:in'		: '.14,.01,.49,0',
		'quad:out'		: '.01,0,.43,1',
		'quad:in:out'	: '.47,.04,.53,.96',
		'cubic:in'		: '.35,0,.65,0',
		'cubic:out'		: '.09,.25,.24,1',
		'cubic:in:out'	: '.66,0,.34,1',
		'quart:in'		: '.69,0,.76,.17',
		'quart:out'		: '.26,.96,.44,1',
		'quart:in:out'	: '.76,0,.24,1',
		'quint:in'		: '.64,0,.78,0',
		'quint:out'		: '.22,1,.35,1',
		'quint:in:out'	: '.9,0,.1,1'
	};
	
	//borderBottomLeftRadius

	context.FxCSS = {

		css: false,
		propRegExp: /([a-z]+)([A-Z][a-z]+)([A-Z].+)/,
		propRadiusRegExp: /([a-z]+)([A-Z][a-z]+)([A-Z][a-z]+)(Radius)/,
		initialize: function(element, options) {

			this.element = this.subject = document.id(element);
			this.transitionend = this.transitionend.bind(this);
			this.parent(Object.append({transition: 'sine:in:out'}, options))
		},
		isRunning: function () { return this.css || this.parent() || false },
		checkTransition: function (style, keys) {
		
			style = div.getPrefixed(style);
			
			var index = keys.indexOf(style);
			
			//is this browser extending shorthand properties ?
			if(index == -1) {
			
				if(this.propRadiusRegExp.test(style)) {
				
					var matches = this.propRadiusRegExp.exec(style);
					
					index = keys.indexOf(matches[1] + matches[4]);
					
					if(index != -1) {
						
						keys.splice(index, 1);
						keys.append(['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'].
							map(function (prop) { return matches[1] + prop + matches[4] }));
							
						index = keys.indexOf(style)	
					}			
				}
				else if(this.propRegExp.test(style)) {
				
					var matches = this.propRegExp.exec(style);
					
					index = keys.indexOf(matches[1] + matches[3]);
					
					if(index != -1) {
						
						keys.splice(index, 1);
						keys.append(['Left', 'Top', 'Right', 'Bottom'].
							map(function (prop) { return matches[1] + prop + matches[3] }));
							
						index = keys.indexOf(style)	
					}			
				}
			}
			
			if(index != -1) keys.splice(index, 1);
			
			return keys.length == 0
		},
		transitionend: function (e) {
				
			if(this.checkTransition(e.event.propertyName, this.keys)) {
			
				this.subject.removeEvent('transitionend', this.transitionend).style[transition] = ''; 
				this.stop()
			}	
		},
		stop: function () {

			if(this.css) {

				this.css = false;
				this.fireEvent('complete', this.subject);
								
				if(!this.callChain()) this.fireEvent('chainComplete', this.subject);

				return this
			}

			return this.parent()
		},
		cancel: function() {

			if (this.css) {
		
				this.css = false;
				Array.from(this.subject).each(function (element) { element.removeEvents('transitionend').style[transition] = '' }, this);
				
				return this.fireEvent('cancel', this.subject).clearChain();
			}

			return this.parent()
		}
	}

}(this);
