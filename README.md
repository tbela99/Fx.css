Fx.CSS
============

this plugin provides two features: animation of the css transform rule and css animations in Fx.Tween, Fx.Morph and Fx.Elements. there is no change required in your script.

[Fx.Tween demo](https://tbela99.github.com/Fx.css/Demos/index-tween.html)
[Fx.Morph demo](https://tbela99.github.com/Fx.css/Demos/index-morph.html)
[Fx.Elements demo](https://tbela99.github.com/Fx.css/Demos/index-elements.html)

How to use
----------

if you just want to enable css transform animation:


### HTML:

	<script script="Fx.Parsers.Transform.js"></script>

### Javascript:

	//make every div that is a form child node editable
	myDiv.tween('transform', ['rotate(0) scale(1, 0) skew(0, 3deg) translate(100px, 50px)', 'rotate(180deg) scale(1.5, 4) skew(0, 3deg) translate(20px, 3px)']);
	anotherDiv.morph({color: '#fff', backgroundColor: '#000', borderColor: '#245884', transform: ['rotate(0deg) scale(1, 0) skew(0, 3deg) translate(100px, 50px)', 'rotate(180deg) scale(1.5, 4) skew(0, 3deg) translate(20px, 3px)']});
						
css animations are not used when transform is one of the properties to be animated:
	
### HTML:

	<script script="Fx.CSS.js"></script>
	<script script="Fx.CSS.Tween.js"></script>
	<script script="Fx.CSS.Morph.js"></script>
	<script script="Stylesheet.js"></script>
	<script script="Fx.CSS.Elements.js"></script>
	
### Javascript:
				
	//make every div that is a form child node editable
	myDiv.tween('height', 100);
	myDiv.morph({color: '#000', backgroundColor: '#fff', borderColor: '#000'});
	
	new Fx.Elements($$(selector)).start({0: {height: 50, width: 20}, 1: {height: 75, width:80}})
		
