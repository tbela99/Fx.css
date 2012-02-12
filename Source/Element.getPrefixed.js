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

provides: [Element.getPrefixed]

...
*/

!function (context) {
"use strict";

	var set = Element.prototype.setStyle,
		get = Element.prototype.getStyle,
		div = new Element('div'),
		prefixes = ['Khtml','O','Ms','Moz','Webkit'],
		cache = {};
			
	Element.implement({

		getPrefixed: function (prop) {  
		
			prop = prop.camelCase();
			
			if(cache[prop] != undefined) return cache[prop];
			
			cache[prop] = prop;
		
			//return unprefixed property if supported. prefixed properties sometimes do not work fine (MozOpacity is an empty string in FF4)
			if(!(prop in this.style)) {
				
				var upper = prop.charAt(0).toUpperCase() + prop.slice(1); 
				
				for(var i = prefixes.length; i--;) if(prefixes[i] + upper in this.style) {
				
					cache[prop] = prefixes[i] + upper; 
					break
				}	
			}
					
			return cache[prop]
		},  
		
		setStyle: function (property, value) {

			return set.call(this, this.getPrefixed(property), value);
		},
		getStyle: function (property) {

			return get.call(this, this.getPrefixed(property));
		}
	})
	
}(this);
