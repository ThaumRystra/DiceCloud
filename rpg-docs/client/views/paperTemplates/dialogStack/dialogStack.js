dialogs = new ReactiveArray();
const offset = 16;
const duration = 400;

pushDialogStack = function({template, data, element, callback}){
	// Generate a new _id so that Blaze knows how to shuffle the array
	const _id = Random.id();
	dialogs.push({
		_id,
		template,
		data,
		element,
		callback,
	});
};

popDialogStack = function(result){
	const dialog = dialogs.pop();
	if (!dialog) return;
	dialog.callback && dialog.callback(result);
};

let cloneHolder;
Template.dialogStack.onRendered(function(){
	cloneHolder = this.find(".clone-holder");
});

Template.dialogStack.helpers({
	dialogStackClass(){
		if (!dialogs.get().length) return "hide";
	},
	dialogs(){
		return dialogs.get();
	},
	dialogStyle(index){
		const length = dialogs.get().length;
		if (!length) return;
		const num = length - 1;
		const left = (num - index) * -offset;
		const top =  (num - index) * -offset;
		return `left:${left}px; top:${top}px;`;
	},
});

Template.dialogStack.events({
	"click .dialog-stack": function(event){
		popDialogStack();
	},
	"click .dialog-sizer": function(event){
		// Returning false from an event handler is the same as calling both
		// stopImmediatePropagation and preventDefault on the event.
		return false;
	},
});

// Only supports border radius defined like "20px" or "100%"
const transformedRadius = (radiusString, deltaWidth, deltaHeight) => {
	if (/^\d+\.?\d*px$/.test(radiusString)){
		//The radius is defined in pixel units, so get the radius as a number
		const rad = +radiusString.match(/\d+\.?\d*/)[0];
		// Set the x and y radius of the "to" element, compensating for scale
		return `${rad / deltaWidth}px / ${rad / deltaHeight}px`;
	} else if (/^\d+\.?\d*%$/.test(radiusString)) {
		//The radius is defined as a percentage, so just use it as is
		return radiusString;
	}
};

const imitate = (
	element, source, deltaLeft, deltaTop, deltaWidth, deltaHeight
) => {
	element.style.transform = `translate(${deltaLeft}px, ${deltaTop}px) ` +
		`scale(${deltaWidth}, ${deltaHeight})`;
	element.style.background = $(source).css("background");
	// Imitate the border radius after transform
	element.style.borderRadius = transformedRadius($(source).css("border-radius"));
}

const dialogOpenAnimation = ({element, dialog}) => {
	const dialogRect = dialog.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	element.style.visibility = "hidden";
	// Get how must the element change to become the dialog
	const deltaLeft = elementRect.left - dialogRect.left;
	const deltaTop = elementRect.top - dialogRect.top;
	const deltaWidth = elementRect.width / dialogRect.width;
	const deltaHeight = elementRect.height / dialogRect.height;

	// Make the dialog imitate the element, immediately
	dialog.style.transition = "none";
	imitate(dialog, element, deltaLeft, deltaTop, deltaWidth, deltaHeight);

	_.defer(() => {
		// Next frame, undo the imitation, let dialog animate back into place
		dialog.style.transition = `all ${duration}ms ease`;
		dialog.style.transform = "";
		dialog.style.borderRadius = "";
		dialog.style.background = "";
	});
	// Clean up after the animation is done and call our callback
	_.delay(() => {
		dialog.style.transition = "";
	}, duration);
}

const dialogCloseAnimation = ({element, dialog, callback}) => {
	// Reset the dialog if it is mid-transition
	dialog.style.transition = "none";
	dialog.style.transform = "none";
	dialog.style.borderRadius = "";
	dialog.style.background = "";
	dialog.style.opacity = "1";
	// Get the original bounding rectangles of both elements
	const dialogRect = dialog.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();
	// Set up a clone of the original element
	// This lets us have a fixed position element which isn't clipped
	clone = element.cloneNode(true);
	clone.style.position = "fixed";
	clone.style.top = 0;
	clone.style.left = 0;
	clone.style.width = elementRect.width + "px";
	clone.style.height = elementRect.height + "px";
	clone.style.visibility = "";
	clone.style.zIndex = 9999;
	// Insert clone before its progenitor so it can inherit css correctly
	element.parentNode.insertBefore(clone, element);
	// Polymer messes up fixed positioning, measure and compensate
	startingRect = clone.getBoundingClientRect();
	clone.style.top = elementRect.top - startingRect.top + "px";
	clone.style.left = elementRect.left - startingRect.left + "px";

	// How must the original dialog change to become the element
	const deltaLeft = dialogRect.left - elementRect.left;
	const deltaTop = dialogRect.top - elementRect.top;
	const deltaWidth = dialogRect.width / elementRect.width;
	const deltaHeight = dialogRect.height / elementRect.height;

	// Make the clone imitate the dialog
	clone.style.transition = "none";
	clone.style.transformOrigin = "top left"
	imitate(clone, dialog, deltaLeft, deltaTop, deltaWidth, deltaHeight);

	_.defer(() => {
		// Next frame, undo the imitation, let clone animate into its place
		clone.style.transition = `all ${duration}ms ease`;
		clone.style.transform = "";
		clone.style.borderRadius = "";
		clone.style.background = "";
		// Make the dialog follow the clone in and fade away
		dialog.style.transition = `all ${duration}ms ease, ` +
									`opacity ${duration * 0.75}ms ease-in`;
		dialog.style.opacity = 0;
		imitate(dialog, element, -deltaLeft,
			-deltaTop, 1 / deltaWidth, 1 / deltaHeight);
	});
	// Clean up after the animation is done and call our callback
	_.delay(() => {
		element.style.visibility = "";
		clone.remove();
		if (callback) callback();
	}, duration);
};

Template.dialogStack.uihooks({
	".dialog": {
		container: ".dialog-sizer",
		insert: function(node, next, tpl) {
			$(node).insertBefore(next);
			const data = Blaze.getData(node);
			if (data.element){
				// Store the reference to the element on the DOM node itself,
				// since Blaze won't keep the data around for the remove hook
				node["data-element"] = data.element;
				dialogOpenAnimation({
					element: data.element,
					dialog: node,
				});
			}
		},
		remove: function(node, tpl) {
			const element = node["data-element"];
			if (element){
				dialogCloseAnimation({
					element,
					dialog: node,
					callback(){
						node.remove();
					},
				});
			} else {
				node.remove();
			}
		},
	}
});

Template.testDialog.events({
	"click .testButton": function(event, template){
		pushDialogStack({
			template: "testDialog",
			element: event.currentTarget,
			data: Random.id(),
		});
	},
})
