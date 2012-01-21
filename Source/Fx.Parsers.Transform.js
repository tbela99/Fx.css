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

	Number.implement({
		toRad: function() { return this * Math.PI/180; },
		toDeg: function() { return this * 180/Math.PI; }
	});

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
	number = '\\s*([-+]?([0-9]*\.)?[0-9]+(e[+-]?[0-9]+)?)';

	px = px.concat(coordinates.map(function (side) { return px[0] + side }));
	generics = generics.concat(coordinates.map(function (side) { return generics[0] + side }));
	deg = deg.concat(coordinates.map(function (side) { return deg[0] + side })).concat(coordinates.map(function (side) { return deg[1] + side }));
	
	Object.append(Element.Styles, {
	
			rgba: 'rgba(@, @, @, @)',
			borderRadius: '@px @px @px @px',
			boxShadow: 'rgb(@, @, @) @px @px @px',
			textShadow: '@px @px @px rgb(@, @, @)'
		});


	Object.append(Fx.CSS.Parsers, {

		Transform: {

			parse: function(value){

				if(!value) return false;
				
				var transform = {}, 
					match;
				
				if((match = value.match(new RegExp('translate3d\\((' + number + ')(px)?\\s*,\\s*('+ number + ')(px)?\\s*,\\s*(' + number + ')(px)?\\s*\\)')))) {
				
					transform.translate3d = [parseFloat(match[1]), parseFloat(match[6]), parseFloat(match[12])]
				}

				if((match = value.match(new RegExp('rotate3d\\(\\s*(' + number + ')\\s*,\\s*('+ number + ')\\s*,\\s*(' + number + ')\\s*,\\s*(' + number + ')(deg|rad)?\\s*\\)')))) {
				
					transform.rotate3d = [parseFloat(match[1]), parseFloat(match[5]), parseFloat(match[9]), match[17] == 'rad' ? parseFloat(match[13]).toDeg() : parseFloat(match[13])]
				}

				if(px.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(' + number + '(px)?\\s*(,' + number + '(px)?\\s*)?\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[6]);

						//allow optional unit for 0
						if(!match[4] && x != 0) return false;

						if(match[5]) {

							if(!match[9] && y != 0) return false;
							transform[t] = [x, y]
						}

						else transform[t] = x
					}

					return true
				}) && deg.every(function (t) {

					//1 - number
					//4 - unit
					//5 - number defined
					//6 - number
					//9 - unit
					if((match = value.match(new RegExp(t + '\\(' + number + '(deg|rad)?\\s*(,' + number + '(deg|rad)?)?\\s*\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[6]);

						//allow optional unit for 0
						if(!match[4] && x != 0) return false;
						
						if(match[5]) {

							if(!match[9] && y != 0) return false;
							transform[t] = [match[5] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1]), match[9] == 'rad' ? parseFloat(match[6]).toDeg() : parseFloat(match[6])]
						}

						else transform[t] = match[4] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1])
					}

					return true
				}) && generics.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*(([0-9]*\\.)?[0-9]+)\\s*(,\\s*(([0-9]*\\.)?[0-9]+)\\s*)?\\)', 'i')))) {

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

						if(transform[t] instanceof Array) style +=  t + '(' + transform[t].map(function (val) { return val + 'deg' }) + ') ';
						else style += t + '(' + transform[t] + 'deg) '
					}
				});

				px.each(function (t) { if(transform[t] != null) style += t + '(' + Array.from(transform[t]).map(function (value) { return value + 'px' }) + ') ' });
				generics.each(function (t) { if(transform[t] != null) style += t + '(' + transform[t] + ') ' });

				if(transform.translate3d) style += ' translate3d(' + transform.translate3d[0]+ 'px,' + transform.translate3d[1]+ 'px,' + transform.translate3d[2]+ 'px)';
				if(transform.rotate3d) style += ' rotate3d(' + transform.rotate3d[0]+ ',' + transform.rotate3d[1]+ ',' + transform.rotate3d[2]+ ', ' + transform.rotate3d[4] + 'deg)';
				
				//console.log(style)
				return style
			}
		}
	})
}();
