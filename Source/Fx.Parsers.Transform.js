/*
---
description: css3 transform rule parser.

license: MIT-style

authors:
- Thierry Bela

credits:
- Pat Cullen (Fx.CSS.Transform)

requires:
core/1.3:
- Array
- Fx.CSS

provides: [Fx.CSS.Parsers.Transform]

...
*/

//TODO: handle matrix style -> turn matrix to rotation & translation ?
!function (undefined) {
"use strict";
/* 
	Number.implement({
		toRad: function() { return this * Math.PI/180; },
		toDeg: function() { return this * 180/Math.PI; }
	}); */

	Fx.CSS.implement({

		compute: function(from, to, delta) {

			var computed = [];

			from = Array.from(from);
			to = Array.from(to);
			
			(Math.min(from.length, to.length)).times(function(i){

				computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
			});
			computed.$family = Function.from('fx:css:value');
			return computed;
		},

		prepare: function(element, property, values) {

			values = Array.from(values);

			if (values[1] == null){

				values[1] = values[0];
				values[0] = element.getStyle(property);
			}

			var parser, parsed;

			if(property.test(/^((Moz|Webkit|Ms|O|Khtml)T|t)ransform/)) {

				parser = Fx.CSS.Parsers.Transform;
				parsed = values.map(function (value) { return {value: parser.parse(value), parser: parser} })
			}

			else parsed = values.map(this.parse);

			return {from: parsed[0], to: parsed[1]};
		}
	});

var deg = ['skew', 'rotate'],
	px = ['translate'],
	generics = ['scale'],
	coordinates = ['X', 'Y', 'Z'], 
	number = '\\s*([-+]?([0-9]*\.)?[0-9]+(e[+-]?[0-9]+)?)',
	degunit = 'deg|rad',
	pxunit = 'px|%';

	px = px.concat(coordinates.map(function (side) { return px[0] + side }));
	generics = generics.concat(coordinates.map(function (side) { return generics[0] + side }));
	deg = deg.concat(coordinates.map(function (side) { return deg[0] + side })).concat(coordinates.map(function (side) { return deg[1] + side }));
	
	Object.append(Element.Styles, {

		rgba: 'rgba(@, @, @, @)',
		borderRadius: '@px @px @px @px',
		boxShadow: 'rgb(@, @, @) @px @px @px',
		textShadow: '@px @px @px rgb(@, @, @)'
	});
		
	Object.append(Element.ShortStyles, {
	
		borderTopLeftRadius: '@px',
		borderTopRightRadius: '@px',
		borderBottomLeftRadius: '@px',
		borderBottomRightRadius: '@px'
	});

	Object.append(Fx.CSS.Parsers, {

		Transform: {

			parse: function(value){

				if(!value) return false;
				
				var transform = {}, 
					match;
				
				if((match = value.match(new RegExp('translate3d\\((' + number + ')(' + pxunit + ')?\\s*,\\s*('+ number + ')(' + pxunit + ')?\\s*,\\s*(' + number + ')(' + pxunit + ')?\\s*\\)')))) {
				
					transform.translate3d = {value: [parseFloat(match[1]), parseFloat(match[6]), parseFloat(match[12])], unit: match[5] || match[7] || match[13] || ''}
				}

				if((match = value.match(new RegExp('rotate3d\\(\\s*(' + number + ')\\s*,\\s*('+ number + ')\\s*,\\s*(' + number + ')\\s*,\\s*(' + number + ')(' + degunit + ')?\\s*\\)')))) {
				
					transform.rotate3d = {value: [parseFloat(match[1]), parseFloat(match[5]), parseFloat(match[9]), parseFloat(match[13])], unit: match[17] || ''}
				}

				if(px.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(' + number + '(' + pxunit + ')?\\s*(,' + number + '(' + pxunit + ')?\\s*)\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[6]);

						//allow optional unit for 0
						if(!match[4] && x != 0) return false;

						if(match[5]) {

							if(!match[9] && y != 0) return false;
							transform[t] = {value: [x, y], unit: match[4] || ''}
						}

						else transform[t] = {value: x, unit: match[4] || ''}
					}

					else if((match = value.match(new RegExp(t + '\\(' + number + '(' + pxunit + ')?\\s*\\)', 'i')))) {

						var x = parseFloat(match[1]);

						//allow optional unit for 0
						if(!match[4] && x != 0) return false;

						transform[t] = {value: x, unit: match[4] || ''}
					}

					return true
				}) && 
				
				deg.every(function (t) {

					//1 - number
					//4 - unit
					//5 - number defined
					//6 - number
					//9 - unit
					if((match = value.match(new RegExp(t + '\\(' + number + '(' + degunit + ')?\\s*(,' + number + '(' + degunit + ')?)\\s*\\)')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[6]);
							
						//allow optional unit for 0
						if(!match[4] && x != 0) return false;
						
						if(match[5]) {

							if(!match[9] && y != 0) return false;
							transform[t] = {value: [parseFloat(match[1]), parseFloat(match[6])], unit: match[5]}
						}

						else transform[t] = {value: parseFloat(match[1]), unit: match[4]}
					}

					else if((match = value.match(new RegExp(t + '\\(' + number + '(' + degunit + ')?\\s*\\)')))) {

						var x = parseFloat(match[1]);
							
						//allow optional unit for 0
						if(!match[4] && x != 0) return false;
						
						transform[t] = {value: parseFloat(match[1]), unit: match[4] || ''}
					}

					return true
				}) && generics.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*(([0-9]*\\.)?[0-9]+)\\s*(,\\s*(([0-9]*\\.)?[0-9]+)\\s*)?\\)')))) {

						if(match[3]) transform[t] = [parseFloat(match[1]), parseFloat(match[4])];

						else transform[t] = parseFloat(match[1])
					}

					return true

				})) return Object.getLength(transform) == 0 ? false : transform;
				
				return false
			},
			compute: function(from, to, delta){

				var computed = {};

				Object.each(to, function (value, key) {

					if(value instanceof Array) {

						computed[key] = Array.from(from[key] == null ? value : Array.from(from[key])).map(function (val, index) {

							return Fx.compute(val == null ? value[index] : val, value[index], delta)
						})
					}

					else computed[key] = Fx.compute(from[key] == null ? value : from[key], value, delta)
				});

				return computed
			},
			serve: function(transform){

				var style = '';
				
				deg.each(function (t) {

					if(transform[t] != null) {

						if(transform[t].value instanceof Array) style +=  t + '(' + transform[t].value.map(function (val) { return val + transform[t].unit }) + ') ';
						else style += t + '(' + transform[t].value + transform[t].unit + ') '
					}
				});

				px.each(function (t) {
				
					if(transform[t] != null) {
					
						style += t + '(' + Array.from(transform[t].value).map(function (value) { return value + transform[t].unit }) + ') ' 
					} 
				});
				
				generics.each(function (t) { if(transform[t] != null) style += t + '(' + transform[t] + ') ' });

				if(transform.translate3d) style += ' translate3d(' + transform.translate3d.value[0]+ transform + transform.translate3d.unit + ',' + transform.translate3d.value[1] +  + transform.translate3d.unit + ',' + transform.translate3d.value[2]+  + transform.translate3d.unit + ')';
				if(transform.rotate3d) style += ' rotate3d(' + transform.rotate3d.value[0]+ ',' + transform.rotate3d.value[1]+ ',' + transform.rotate3d.value[2]+ ', ' + transform.rotate3d.value[4] + transform.rotate3d.unit + ')';
				
				return style
			}
		}
	})
}();
