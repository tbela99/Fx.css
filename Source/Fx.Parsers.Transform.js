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
- Fx/Fx.CSS

provides: [Fx.CSS.Parsers.Transform]

...
*/

(function () {

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

			if(property == 'transform') {

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
	coordinates = ['X', 'Y', 'Z'];

	px = px.concat(coordinates.map(function (side) { return px[0] + side }));
	generics = generics.concat(coordinates.map(function (side) { return generics[0] + side }));
	deg = deg.concat(coordinates.map(function (side) { return deg[0] + side })).concat(coordinates.map(function (side) { return deg[1] + side }));

	Object.merge(Fx.CSS.Parsers, {

		Transform: {

			parse: function(value){

				if(!value) return false;
				
				var transform = {};

				if(px.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*([-+]?([0-9]*\\.)?[0-9]+)(px)?\\s*(,\\s*([-+]?([0-9]*\\.)?[0-9]+)(px)?\\s*)?\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[5]);

						//allow optional unit for 0
						if(!match[3] && x != 0) return false;

						if(match[4]) {

							if(!match[7] && y != 0) return false;
							transform[t] = [x, y]
						}

						else transform[t] = x
					}

					return true
				}) && deg.every(function (t) {

					if((match = value.match(new RegExp(t + '\\(\\s*([-+]?([0-9]*\\.)?[0-9]+)(deg|rad)?\\s*(,\\s*([-+]?([0-9]*\\.)?[0-9]+)(deg|rad)?)?\\s*\\)', 'i')))) {

						var x = parseFloat(match[1]),
							y = parseFloat(match[5]);

						//allow optional unit for 0
						if(!match[3] && x != 0) return false;
						if(match[4]) {

							if(!match[7] && y != 0) return false;
							transform[t] = [match[3] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1]), match[7] == 'rad' ? parseFloat(match[5]).toDeg() : parseFloat(match[5])]
						}

						else transform[t] = match[3] == 'rad' ? parseFloat(match[1]).toDeg() : parseFloat(match[1])
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

				return style
			}
		}
	})
})();
