/**
 * Take in a map like this:
 * {
 *   "#someId": {
 *     proprty1() { return someReactiveValue()}
 *   }
 * }
 * and bind the properties to the DOM on autorun.
 *
 * Useful for polymer components where you need to set the order of property updating
 * or alter properties that don't bind well to their attributes
 */
Blaze.Template.prototype.binding = function(bindingMap){
	this.onRendered(function(){
		_.each(bindingMap, (propertyMap, cssPattern) => {
			node = this.find(cssPattern);
			_.each(propertyMap, (func, property) => {
				this.autorun(() => {
					node[property] = func && func.call && func.call(this, node);
				});
			});
		});
	});
};
