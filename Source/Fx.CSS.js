/*
---
description: native css animations.

license: MIT-style

authors:
- Thierry Bela

credits:
- amadeus (CSSEvents)
- André Fiedler, eskimoblood (Fx.Tween.CSS3)

requires:
core/1.3:
- Array
- Element.Style
- Fx.CSS

provides: [FxCSS]

...
*/

!function () {


	var set = Element.prototype.setStyle,
		get = Element.prototype.getStyle,
		//vendor = '',
		div = new Element('div'),
		prefix = Browser.safari || Browser.chrome || Browser.Platform.ios ? 'webkit' : (Browser.opera ? 'o' : (Browser.ie ? 'ms' : '')),
		prefixes = ['Khtml','Moz','Webkit','O','ms'];
			
	function getPrefix(prop) {  
	
		var upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		for(var i = prefixes.length; i--;) if(prefixes[i] + upper in div.style) return prefixes[i] + upper; 
				
		return prop;  
	}  
	
	Element.implement({

		setStyle: function (property, value) {

			return set.call(this, getPrefix(property), value);
		},
		getStyle: function (property) {

			return get.call(this, getPrefix(property));
		}
	});

	//eventTypes
	['transitionStart', 'transitionEnd'/* , 'animationStart', 'animationIteration', 'animationEnd' */].each(function(eventType){

		Element.NativeEvents[eventType.toLowerCase()] = 2;

		var customType = eventType;
		
		if (prefix) customType = prefix + customType.capitalize();
		else customType = customType.toLowerCase();

		Element.NativeEvents[customType] = 2;
		Element.Events[eventType.toLowerCase()] = {base: customType }
		
	}, this);
	
	//detect if transition property is supported
	Fx.css3Transition = (function (prop) {
	
		if(prop in div.style) return true;
		
		var prefixes = ['Khtml','Moz','Webkit','O','ms'], upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
		
		for(var i = prefixes.length; i--;) if(prefixes[i] + upper in div.style) return true; 
				
		return false
	})('transition');
	
	Fx.transitionTimings = {
		'linear'		: '0,0,1,1',
		'expo:in'		: '0.71,0.01,0.83,0',
		'expo:out'		: '0.14,1,0.32,0.99',
		'expo:in:out'	: '0.85,0,0.15,1',
		'circ:in'		: '0.34,0,0.96,0.23',
		'circ:out'		: '0,0.5,0.37,0.98',
		'circ:in:out'	: '0.88,0.1,0.12,0.9',
		'sine:in'		: '0.22,0.04,0.36,0',
		'sine:out'		: '0.04,0,0.5,1',
		'sine:in:out'	: '0.37,0.01,0.63,1',
		'quad:in'		: '0.14,0.01,0.49,0',
		'quad:out'		: '0.01,0,0.43,1',
		'quad:in:out'	: '0.47,0.04,0.53,0.96',
		'cubic:in'		: '0.35,0,0.65,0',
		'cubic:out'		: '0.09,0.25,0.24,1',
		'cubic:in:out'	: '0.66,0,0.34,1',
		'quart:in'		: '0.69,0,0.76,0.17',
		'quart:out'		: '0.26,0.96,0.44,1',
		'quart:in:out'	: '0.76,0,0.24,1',
		'quint:in'		: '0.64,0,0.78,0',
		'quint:out'		: '0.22,1,0.35,1',
		'quint:in:out'	: '0.9,0,0.1,1'
	};
	
	this.FxCSS = {

		Binds: ['onComplete'],
		initialize: function(element, options){

			this.element = this.subject = document.id(element);
			this.parent(Object.merge({transition: 'sine:in:out'}, options));
			this.events = {transitionend: this.onComplete}
		},

		check: function(){

			if (this.css) {

				if(!this.locked && !this.running) return true
			}

			else if (!this.timer) return true;

			switch (this.options.link) {

				case 'cancel': this.cancel(); return true;
				case 'chain': this.chain(this.caller.pass(arguments, this)); return false;
			}

			return false;
		},

		onComplete: function () {

			//if(window.console && console.log) console.log(['completed', this.css]);
			if(this.css && this.running) {

				this.element.removeEvents(this.events).setStyle('transition', 'none');
				this.running = false
			}

			this.css = false;
			this.locked = false;

			return this.parent()
		},

		cancel: function() {

			if (this.css && this.running) {

				this.running = false;
				this.css = false
			}

			return this.parent()
		}
	}

}();
