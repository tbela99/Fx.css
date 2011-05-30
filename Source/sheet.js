/*
---
name : sg-regex-tools
description : A few super-handy tools for messing around with RegExp

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : [combineRegExp]
...
*/
;(function(exports){

exports.combineRegExp = function(regex, group){
	if (regex.source) regex = [regex]
	
	var names = [], i, source = '', this_source
	
	for (i = 0; i < regex.length; ++i){ if (!regex[i]) continue
		this_source = regex[i].source || ''+regex[i]
		if (this_source == '|') source += '|'
		else {
			source += (group?'(':'') + this_source.replace(/\s/g,'') + (group?')':'')
			if (group) names.push(group)
		}
		if (regex[i].names)	names = names.concat(regex[i].names)
	}
	try {
		regex = new RegExp(source,'gm')
	}
	catch (e){
		throw new SyntaxError('Invalid Syntax: ' + source +'; '+ e)
	}
	// [key] → 1
	for (i = -1; i < names.length; ++i) names[names[i]] = i + 1
	// [1] → key
	regex.names = names
	return regex
}

}(typeof exports != 'undefined' ? exports : this));
/*
---
name    : Sheet

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : Sheet
requires : SheetParser.CSS
...
*/
;(function(exports){


/*<depend>*/
var UNDEF = {undefined:1}

/*<CommonJS>*/
var SheetParser = UNDEF[typeof require]
	?	exports.SheetParser
	:	require('./SheetParser.CSS').SheetParser

exports.Sheet = Sheet
/*</CommonJS>*/

/*<debug>*/;if (!(!UNDEF[typeof SheetParser] && SheetParser.CSS)) throw new Error('Missing required function: "SheetParser.CSS"');/*</debug>*/
/*</depend>*/


Sheet.version = '1.0.2 dev'

function Sheet(cssText){
	if (this instanceof Sheet) this.initialize(cssText)
	else return Sheet.from(cssText)
}

Sheet.from = function(cssText){
	return new Sheet(cssText)
}

Sheet.prototype = {
	
	parser: SheetParser.CSS,
	
	initialize: function(cssText){
		this.cssText = cssText || ''
		this.style = this.rules = this.cssRules = this.parser.parse(this.cssText)
		var self = this
	},
	
	update: function(){
		var cssText = '',
			i = -1,
			rule,
			rules = this.style || this.rules || this.cssRules
		
		while ((rule = rules[++i])){
			if (typeof rule == 'object'){
				// cssRule
				if (this.update) rule.cssText = this.update.call(rule)
				cssText += rule.cssText = rule.selectorText + '{' + rule.cssText + '}'
			} else {
				// style key/value
				cssText += rule + ':'
				cssText += rules[rule] + ';'
			}
		}
		
		if (rules.selectorText)
			return rules.cssText = rules.selectorText + '{' + cssText + '}'
		return rules.cssText = cssText
	}
	
}

Sheet.prototype.toString = Sheet.prototype.update


}(typeof exports != 'undefined' ? exports : this));

/*
---
name : Sheet.DOM
description : Sheet.DOM adds some handy stuff for working with the browser's native CSS capabilities.

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : Sheet.DOM
...
*/
;(function(document,styleSheets){

if (typeof Sheet == 'undefined') Sheet = {}
if (Sheet.DOM == null) Sheet.DOM = {}

Sheet.DOM.createSheetNode = function(raw){
	var sheet = Sheet.DOM.createSheet(raw)
	var node = sheet.ownerNode
	node.parentNode.removeChild(node)
	return node
}

var UID = 0

Sheet.DOM.createSheet = createStyleSheetWithCSS
function createStyleSheetWithCSS(css){
	var styleElement = document.createElement("style")
	styleElement.appendChild(document.createTextNode(css))
	styleElement.setAttribute('name', styleElement.id = "SheetRuler-" + +new Date)
	document.getElementsByTagName('head')[0].appendChild(styleElement)

	return styleElement.sheet || styleElement.styleSheet
}

Sheet.DOM.createStyle = function(raw){
	var div = document.createElement('div')
	div.innerHTML = '<p style="' + String_escapeHTML.call(raw) + '"></p>'
	return div.firstChild.style
}

Sheet.DOM.createSheetStyle = function(raw){
	var className = 'Sheet' + +new Date
	var sheet = Sheet.DOM.createSheet("." + className + "{" + raw + "}")
	return (sheet.rules || sheet.cssRules)[0].style
}

Sheet.DOM.createRule = function(selector,style){
	var rule = selector + "{" + style + "}"
	
	var sheet = Sheet.DOM.createSheet(rule)
	var rules = sheet.rules || sheet.cssRules
	return rules[rules.length - 1]
}

Sheet.DOM.createStyleWrapped = function(raw){
	return {style:Sheet.DOM.createStyle(raw)}
}

function String_escapeHTML(){
	return ('' + this).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
}

}(document, document.styleSheets));

/*
---
name    : SheetParser.CSS

authors   : Thomas Aylott
copyright : © 2010 Thomas Aylott
license   : MIT

provides : SheetParser.CSS
requires : combineRegExp
...
*/
;(function(exports){
	

/*<depend>*/
var UNDEF = {undefined:1}
if (!exports.SheetParser) exports.SheetParser = {}

/*<CommonJS>*/
var combineRegExp = UNDEF[typeof require]
	?	exports.combineRegExp
	:	require('./sg-regex-tools').combineRegExp
var SheetParser = exports.SheetParser
/*</CommonJS>*/

/*<debug>*/;if (UNDEF[typeof combineRegExp]) throw new Error('Missing required function: "combineRegExp"');/*</debug>*/
/*</depend>*/


var CSS = SheetParser.CSS = {version: '1.0.2 dev'}

CSS.trim = trim
function trim(str){
	// http://blog.stevenlevithan.com/archives/faster-trim-javascript
	var	str = (''+str).replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

CSS.camelCase = function(string){
	return ('' + string).replace(camelCaseSearch, camelCaseReplace)
}
var camelCaseSearch = /-\D/g
function camelCaseReplace(match){
	return match.charAt(1).toUpperCase()
}

CSS.parse = function(cssText){
	var	found
	,	rule
	,	rules = {length:0}
	,	keyIndex = -1
	,	regex = this.parser
	,	names = CSS.parser.names
	,	i,r,l
	,	ruleCount
	
	rules.cssText = cssText = trim(cssText)
	
	// strip comments
	cssText = cssText.replace(CSS.comment, '');
	
	regex.lastIndex = 0
	while ((found = regex.exec(cssText))){
		// avoid an infinite loop on zero-length keys
		if (regex.lastIndex == found.index) ++ regex.lastIndex
		
		// key:value
		if (found[names._key]){
			rules[rules.length ++] = found[names._key]
			rules[found[names._key]] = found[names._value]
			rules[CSS.camelCase(found[names._key])] = found[names._value]
			continue
		}
		
		rules[rules.length++] = rule = {}
		for (i = 0, l = names.length; i < l; ++i){
			if (!(names[i-1] && found[i])) continue
			rule[names[i-1]] = trim(found[i])
		}
	}
	
	var atKey, atRule, atList, atI
	for (i = 0, l = rules.length; i < l; ++i){
		if (!rules[i]) continue
		
		if (rules[i]._style_cssText){
			rules[i].style = CSS.parse(rules[i]._style_cssText)
			delete rules[i]._style_cssText
		}
		
		// _atKey/_atValue
		if (atKey = rules[i]._atKey){
			atKey = CSS.camelCase(atKey)
			atRule = {length:0}
			rules[i][atKey] = atRule
			atRule["_source"] =
			atRule[atKey + "Text"] = rules[i]._atValue
			atList = ('' + rules[i]._atValue).split(/,\s*/)
			for (atI = 0; atI < atList.length; ++atI){
				atRule[atRule.length ++] = atList[atI]
			}
			rules[i].length = 1
			rules[i][0] = atKey
			delete rules[i]._atKey
			delete rules[i]._atValue
		}
		
		if (rules[i].style)
		for (ruleCount = -1, r = -1, rule; rule = rules[i].style[++r];){
			if (typeof rule == 'string') continue
			rules[i][r] = (rules[i].cssRules || (rules[i].cssRules = {}))[++ ruleCount]  = rule
			rules[i].cssRules.length = ruleCount + 1
			rules[i].rules = rules[i].cssRules
		}
	}
	
	return rules
}

var x = combineRegExp
var OR = '|'

;(CSS.at = x(/\s*@([-a-zA-Z0-9]+)\s+(([\w-]+)?[^;{]*)/))
.names=[         '_atKey',           '_atValue', 'name']

CSS.atRule = x([CSS.at, ';'])

;(CSS.keyValue_key = x(/([-a-zA-Z0-9]+)/))
.names=[                '_key']

;(CSS.keyValue_value_end = x(/(?:;|(?=\})|$)/))

;(CSS.notString = x(/[^"']+/))
;(CSS.stringSingle = x(/"(?:[^"]|\\")*"/))
;(CSS.stringDouble = x(/'(?:[^']|\\')*'/))
;(CSS.string = x(['(?:',CSS.stringSingle ,OR, CSS.stringDouble,')']))
;(CSS.propertyValue = x([/[^;}]+/, CSS.keyValue_value_end]))

var rRound = "(?:[^()]|\\((?:[^()]|\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\))*\\))"

;(CSS.keyValue_value = x(
[
	x(['((?:'
	,	CSS.stringSingle
	,	OR
	,	CSS.stringDouble
	,	OR
	,	"\\("+rRound+"*\\)"
	,	OR
	,	/[^;}()]/ // not a keyValue_value terminator
	,	')*)'
	])
,	CSS.keyValue_value_end
])).names = ['_value']

;(CSS.keyValue = x([CSS.keyValue_key ,/\s*:\s*/, CSS.keyValue_value]))

;(CSS.comment = x(/\/\*\s*((?:[^*]|\*(?!\/))*)\s*\*\//))
.names=[                   'comment']

;(CSS.selector = x(['(',/\s*(\d+%)\s*/,OR,'(?:',/[^{}'"()]|\([^)]*\)|\[[^\]]*\]/,')+',')']))
.names=[    'selectorText','keyText']

var rCurly = "(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{(?:[^{}]|\\{[^{}]*\\})*\\})*\\})*\\})"
var rCurlyRound = "(?:[^{}()]+|\\{(?:[^{}()]+|\\{(?:[^{}()]+|\\{(?:[^{}()]+|\\{[^{}()]*\\})*\\})*\\})*\\})"

;(CSS.block = x("\\{\\s*((?:"+"\\("+rRound+"*\\)|"+rCurly+")*)\\s*\\}"))
.names=[              '_style_cssText']

CSS.selectorBlock = x([CSS.selector, CSS.block])

CSS.atBlock = x([CSS.at, CSS.block])

CSS.parser = x
(
	[	x(CSS.comment)
	,	OR
	,	x(CSS.atBlock)
	,	OR
	,	x(CSS.atRule)
	,	OR
	,	x(CSS.selectorBlock)
	,	OR
	,	x(CSS.keyValue)
	]
,	'cssText'
);


})(typeof exports != 'undefined' ? exports : this);

/*
---
name    : SheetParser.Property

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.CSS

provides : SheetParser.Property
...
*/


(function(exports) {
  /*<CommonJS>*/
  var combineRegExp = (typeof require == 'undefined')
    ?  exports.combineRegExp
    :  require('./sg-regex-tools').combineRegExp
  var SheetParser = exports.SheetParser
  /*</CommonJS>*/
  
  var Property = SheetParser.Property = {version: '0.2 dev'};
  
  /*
    Finds optional groups in expressions and builds keyword
    indecies for them. Keyword index is an object that has
    keywords as keys and values as property names.
    
    Index only holds keywords that can be uniquely identified
    as one of the properties in group.
  */
  
  Property.index = function(properties, context) {
    var index = {};
    for (var i = 0, property; property = properties[i]; i++) {
      if (property.push) {
        var group = index[i] = {};
        for (var j = 0, prop; prop = property[j]; j++) {
          var keys = context[prop].keywords;
          if (keys) for (var key in keys) {
            if (group[key] == null) group[key] = prop;
            else group[key] = false;
          }
        }
        for (var keyword in group) if (!group[keyword]) delete group[keyword];
      }
    }
    return index;
  };
  
  /*
    Simple value 
  */

  Property.simple = function(types, keywords) {
    return function(value) {
      if (keywords && keywords[value]) return true;
      if (types) for (var i = 0, type; type = types[i++];) if (Type[type](value)) return true;
      return false;
    }
  };
  
  /*
    Links list of inambigous arguments with corresponding properties keeping
    the order.
  */
  
  Property.shorthand = function(properties, keywords, context) {
    var index, r = 0;
    for (var i = 0, property; property = properties[i++];) if (!property.push) r++;
    return function() {
      var result = [], used = {}, start = 0, group, k = 0, l = arguments.length;
      for (var i = 0, argument; argument = arguments[i]; i++) {
        var property = properties[k];
        if (!property) return false;
        if ((group = (property.push && property))) property = properties[k + 1];
        if (property) {
          if (context[property](argument)) k++
          else property = false
        }
        if (group) {
          if (!property) {
            if (!index) index = Property.index(properties, context)
            if (property = index[k][argument])
              if (used[property]) return false;
              else used[property] = 1;
          }
          if ((property && !used[property]) || (i == l - 1)) {
            if (i - start > group.length) return false;
            for (var j = start; j < (i + +!property); j++) 
              if (!result[j])
                for (var m = 0, optional; optional = group[m++];) {
                  if (!used[optional] && context[optional](arguments[j])) {
                    result[j] = optional;
                    used[optional] = true
                    break;
                  }
                }
            start = i;
            k++;
          }
        }
        if (result[i] == null) result[i] = property;
      }
      if (i < r) return false
      for (var i = 0, j = arguments.length, object = {}; i < j; i++) {
        var value = result[i];
        if (!value) return false;
        object[value] = arguments[i];
      }
      return object;
    };
  }

  /*
    A shorthand that operates on collection of properties. When given values
    are not enough (less than properties in collection), the value sequence
    is repeated until all properties are filled.     
  */

  Property.collection = function(properties, keywords, context) {
    var first = context[properties[0]];
    if (first.type != 'simple') 
      return function(arg) {
        var args = (!arg || !arg.push) ? [Array.prototype.slice.call(arguments)] : arguments;
        var length = args.length;
        var result = {};
        for (var i = 0, property; property = properties[i]; i++) {
          var values = context[property].apply(1, args[i] || args[i % 2] || args[0]);
          if (!values) return false;
          for (var prop in values) result[prop] = values[prop];
        }
        return result;
      }
    else
      return function() {
        var length = arguments.length;
        var result = {};
        for (var i = 0, property; property = properties[i]; i++) {
          var values = arguments[i] || arguments[i % 2] || arguments[0];
          if (!context[property].call(1, values)) return false;
          result[property] = values;
        }
        return result;
      }
  };
  
  /* 
    Multiple value property accepts arrays as arguments
    as well as regular stuff
  */
  
  Property.multiple = function(arg) {
    //if (arg.push)
  }
  
  Property.compile = function(definition, context) {
    var properties, keywords, types;
    for (var i = 0, bit; bit = definition[i++];) {
      if (bit.push) properties = bit;
      else if (bit.indexOf) {
        if (!Type[bit]) {
          if (!keywords) keywords = {};
          keywords[bit] = 1;
        } else types ? types.push(bit) : (types = [bit]);
      } else options = bit;
    }
    var type = properties ? (keywords && keywords.collection ? "collection" : "shorthand") : 'simple'
    var property = Property[type](properties || types, keywords, context);
    if (keywords) property.keywords = keywords;
    if (properties) {
      var props = [];
      for (var i = 0, prop; prop = properties[i++];) prop.push ? props.push.apply(props, prop) : props.push(prop);
      property.properties = props;
    }
    property.type = type;
    return property;
  };
  
  
  var Type = Property.Type = {
    length: function(obj) {
      return typeof obj == 'number' || (!obj.indexOf && ('number' in obj) && obj.unit && (obj.unit != '%'))
    },
  
    color: function(obj) {
      return obj.indexOf ? obj.match(/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/) : (obj.isColor || obj.rgba || obj.rgb || obj.hsb)
    },
    
    number: function(obj) {
      return typeof obj == 'number'
    },
    
    integer: function(obj) {
      return obj % 1 == 0 && ((0 + obj).toString() == obj)
    },
  
    keyword: function(keywords) {
      var storage;
      for (var i = 0, keyword; keyword = keywords[i++];) storage[keyword] = 1;
      return function(keyword) {
        return !!storage[keyword]
      }
    },
    
    strings: function(obj) {
      return !!obj.indexOf
    },
    
    url: function(obj) {
      return !obj.indexOf && ("url" in obj);
    },
    
    position: function(obj) {        
      var positions = Type.position.positions;
      if (!positions) positions = Type.position.positions = {left: 1, top: 1, bottom: 1, right: 1, center: 1}
      return positions[obj]
    },
    
    percentage: function(obj) {
      return obj.unit == '%'
    }
  };
  
})(typeof exports != 'undefined' ? exports : this);

/*
---
name    : SheetParser.Styles

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.Property

provides : SheetParser.Styles
...
*/

(function() {
   
var SheetParser = (typeof exports == 'undefined') ? window.SheetParser : exports.SheetParser;
var CSS = SheetParser.Properties = {
  background:           [[['backgroundColor', 'backgroundImage', 'backgroundRepeat', 
                          'backgroundAttachment', 'backgroundPositionX', 'backgroundPositionY']], 'multiple'],
  backgroundColor:      ['color', 'transparent', 'inherit'],
  backgroundImage:      ['url', 'none', 'inherit'],
  backgroundRepeat:     ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'inherit', 'space', 'round'],
  backgroundAttachment: ['fixed', 'scroll', 'inherit', 'local', 'fixed'],
  backgroundPosition:   [['backgroundPositionX', 'backgroundPositionY']],
  backgroundPositionX:  ['percentage', 'center', 'left', 'right', 'length', 'inherit'],
  backgroundPositionY:  ['percentage', 'center', 'top', 'bottom', 'length', 'inherit'],
   
  textShadow:           [['textShadowBlur', 'textShadowOffsetX', 'textShadowOffsetY', 'textShadowColor'], 'multiple'],
  textShadowBlur:       ['length'],
  textShadowOffsetX:    ['length'],
  textShadowOffsetY:    ['length'],
  textShadowColor:      ['color'],
                        
  boxShadow:            [['boxShadowBlur', 'boxShadowOffsetX', 'boxShadowOffsetY', 'boxShadowColor'], 'multiple'],
  boxShadowBlur:        ['length'],
  boxShadowOffsetX:     ['length'],
  boxShadowOffsetY:     ['length'],
  boxShadowColor:       ['color'], 
  
  outline:              ['outlineWidth', 'outlineStyle', 'outlineColor'],
  outlineWidth:         ['length'],
  outlineStyle:         ['dotted', 'dashed', 'solid', 'double', 'groove', 'reidge', 'inset', 'outset'],
  outlineColor:         ['color'],
                        
  font:                 [[
                          ['fontStyle', 'fontVariant', 'fontWeight'], 
                          'fontSize', 
                          ['lineHeight'], 
                          'fontFamily'
                        ]],
  fontStyle:            ['normal', 'italic', 'oblique', 'inherit'],
  fontVariant:          ['normal', 'small-caps', 'inherit'],
  fontWeight:           ['normal', 'number', 'bold', 'inherit'],
  fontFamily:           ['strings', 'inherit'],
  fontSize:             ['length', 'percentage', 'inherit', 
                         'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger'],
                        
  color:                ['color'],
  letterSpacing:        ['normal', 'length', 'inherit'],
  textDecoration:       ['none', 'capitalize', 'uppercase', 'lowercase'],
  textAlign:            ['left', 'right', 'center', 'justify'],
  textIdent:            ['length', 'percentage'],                 
  lineHeight:           ['normal', 'length', 'number', 'percentage'],
  
  height:               ['length', 'auto'],
  maxHeight:            ['length', 'auto'],
  minHeight:            ['length', 'auto'],
  width:                ['length', 'auto'],
  maxWidth:             ['length', 'auto'],
  minWidth:             ['length', 'auto'],
                        
  display:              ['inline', 'block', 'list-item', 'run-in', 'inline-block', 'table', 'inline-table', 'none', 
                         'table-row-group', 'table-header-group', 'table-footer-group', 'table-row', 
                         'table-column-group', 'table-column', 'table-cell', 'table-caption'],
  visibility:           ['visible', 'hidden'],
  'float':              ['none', 'left', 'right'],
  clear:                ['none', 'left', 'right', 'both', 'inherit'],
  overflow:             ['visible', 'hidden', 'scroll', 'auto'],
  position:             ['static', 'relative', 'absolute', 'fixed'],
  top:                  ['length', 'auto'],
  left:                 ['length', 'auto'],
  right:                ['length', 'auto'],
  bottom:               ['length', 'auto'],
  zIndex:               ['integer'],
  cursor:               ['auto', 'crosshair', 'default', 'hand', 'move', 'e-resize', 'ne-resize', 'nw-resize', 
                         'n-resize', 'se-resize', 'sw-resize', 's-resize', 'w-resize', 'text', 'wait', 'help'],
};

var expanded = ['borderWidth', 'borderColor', 'borderStyle', 'padding', 'margin', 'border'];
for (var side, sides = ['Top', 'Right', 'Bottom', 'Left'], i = 0; side = sides[i++];) {
  CSS['border' + side]           = [['border' + side + 'Width', 'border' + side + 'Style', 'border' + side + 'Color']];
  
  CSS['border' + side + 'Width'] = ['length', 'thin', 'thick', 'medium'];
  CSS['border' + side + 'Style'] = ['none', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'none'];
  CSS['border' + side + 'Color'] = ['color'];
  
  CSS['margin' + side]           = ['length', 'percentage', 'auto'];
  CSS['padding' + side]          = ['length', 'percentage', 'auto'];

  for (var j = 0, prop; prop = expanded[j++];) {
    if (!CSS[prop]) CSS[prop] = [[]];
    CSS[prop][0].push(prop.replace(/^([a-z]*)/, '$1' + side));
    if (i == 4) CSS[prop].push('collection')
  }

  if (i % 2 == 0) 
    for (var j = 1, adj; adj = sides[j+=2];) 
      CSS['borderRadius' + side + adj] = ['length', 'none'];
};

var Styles = SheetParser.Styles = {}
for (var property in CSS) Styles[property] = SheetParser.Property.compile(CSS[property], Styles);

})();

/*
---
name    : SheetParser.Value

authors   : Yaroslaff Fedin

license   : MIT

requires : SheetParser.CSS

provides : SheetParser.Value
...
*/


(function(exports) {
  /*<CommonJS>*/
  var combineRegExp = (typeof require == 'undefined')
    ?  exports.combineRegExp
    :  require('./sg-regex-tools').combineRegExp
  var SheetParser = exports.SheetParser
  /*</CommonJS>*/
  
  var Value = SheetParser.Value = {version: '1.0.2 dev'};
  
  Value.translate = function(value) {
    var found, result = [], matched = [], scope = result, func, text;
    var regex = Value.tokenize;
    var names = regex.names;
    while (found = regex.exec(value)) matched.push(found);
    for (var i = 0; found = matched[i++];) {
      if (func = found[names['function']]) {
        var obj = {};
        var translated = obj[found[names['function']]] = Value.translate(found[names._arguments]);
        for (var j = 0, bit; bit = translated[j]; j++) if (bit && bit.length == 1) translated[j] = bit[0];
        scope.push(obj);
      } else if (found[names.comma]) {
        if (!result[0].push) result = [result];
        result.push(scope = []);
      } else if (found[names.whitespace]) {
        var length = scope.length;
        if (length && (scope == result) && !scope[length - 1].push) scope = scope[length - 1] = [scope[length - 1]];
        
      } else if (text = (found[names.dstring] || found[names.sstring])) {
        scope.push(text)
      } else if (text = found[names.token]) {
        if (!text.match(Value.hex)) {
          var match = Value.length.exec(text);
          Value.length.lastIndex = 0;
          if (match) {
            var number = parseFloat(match[1]);
            text = match[2] ? {number: number, unit: match[2]} : number;
          } else if (!text.match(Value.keyword)) return false;
        }
        scope.push(text);
      }
    }
    return result.length == 1 ? result[0] : result;
  }
  
  var x = combineRegExp
  var OR = '|'
  var rRound = "(?:[^()]|\\((?:[^()]|\\((?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*\\))*\\))";

  ;(Value.stringDouble = x(/"((?:[^"]|\\")*)"/)).names = ['dstring']
  ;(Value.stringSingle = x(/'((?:[^']|\\')*)'/)).names = ['sstring']
  ;(Value.string = x([Value.stringSingle, OR, Value.stringDouble]))
  ;(Value.keyword = x(/[-a-zA-Z0-9]+/, "keyword"))
  ;(Value.token = x(/[^$,\s\/)]+/, "token"))
  
  ;(Value['function'] = x("([-a-zA-Z0-9]+)\\((" + rRound + "*)\\)"))
  .names = [               'function',       '_arguments']
  
  ;(Value.integer = x(/-?\d+/))
  ;(Value.float = x(/-?\d+\.\d*/))
  ;(Value.number = x(['(', Value.float,  OR, Value.integer, ')']))
  .names = [           'number']

  ;(Value.unit = x(/em|px|pt|%|fr/, 'unit'))
  ;(Value.length = x(['^', Value.number, Value.unit, "?$"]))
  ;(Value.direction = x(/top|left|bottom|right|center/, 'direction'))
  ;(Value.position = x([Value.length, OR, Value.direction]))

  ;(Value.hex = x(/#[0-9a-z]+/, 'hex'))

  ;(Value.comma = x(/\s*,\s*/, 'comma'))
  ;(Value.whitespace = x(/\s+/, 'whitespace'))
  ;(Value.slash = x(/\//, 'slash'))


  Value.tokenize = x
  (
    [ x(Value['function']),
    , OR
    , x(Value.comma)
    , OR
    , x(Value.whitespace)
    , OR
    , x(Value.slash)
    , OR
    , x(Value.string)
    , OR
    , x(Value.token)
    ]
  )
  
})(typeof exports != 'undefined' ? exports : this);


