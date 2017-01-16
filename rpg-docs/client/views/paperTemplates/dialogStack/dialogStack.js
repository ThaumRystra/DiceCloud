dialogs = new ReactiveArray();
const offset = 16;

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

Template.dialogStack.helpers({
	dialogStackClass(){
		if (!dialogs.get().length) return "hide";
	},
	dialogs(){
		return dialogs.get();
	},
	dialogStyle(index){
		const num = dialogs.get().length - 1;
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

const heroAnimate = ({from, to, duration, useClone, callback}) => {
	if (!from) throw "From element must be defined";
	if (!to) throw "To element must be defined";
	duration = duration || 400;
	// Get the bounding rectangles of both elements
	const toRect = to.getBoundingClientRect();
	const fromRect = from.getBoundingClientRect();
	let originalNode;
	let originalVis;
	if (useClone){
		originalNode = to;
		to = originalNode.cloneNode(true);
		originalNode.parentNode.insertBefore(to, originalNode);
		to.style.position = "fixed";
		to.style.zIndex = "9999";
		originalVis = originalNode.style.visibility;
		originalNode.style.visibility = "hidden";
	}
	// Get how they have changed
	const deltaLeft = fromRect.left - toRect.left;
	const deltaTop = fromRect.top - toRect.top;
	const deltaWidth = fromRect.width / toRect.width;
	const deltaHeight = fromRect.height / toRect.height;
	// Make the "to" element imitate the "from" element
	to.style.transition = "none";
	to.style.transform = `translate(${deltaLeft}px, ${deltaTop}px) ` +
		`scale(${deltaWidth}, ${deltaHeight})`;
	to.style.background = $(from).css("background");
	to.style.boxShadow = $(from).css("box-shadow");
	// Imitate the border radius after transform
	// Only supports border radius defined like "20px" or "100%"
	let radius = $(from).css("border-radius");
	if (/^\d+\.?\d*px$/.test(radius)){
		//The radius is defined in pixel units, so get the radius as a number
		const rad = +radius.match(/\d+\.?\d*/)[0];
		// Set the x and y radius of the "to" element, compensating for scale
		to.style.borderRadius = `${rad / deltaWidth}px / ${rad / deltaHeight}px`;
	} else if (/^\d+\.?\d*%$/.test(radius)) {
		//The radius is defined as a percentage, so just use it as is
		to.style.borderRadius = radius;
	}
	// Don't animate to the imitation position
	to.style.transition = "none";
	// We calculate everything from the top left, so use that as origin
	to.style.transformOrigin = "top left";

	// Next frame, undo the imitation, let "to" animate into its place
	_.defer(() => {
		to.style.transition = `all ${duration / 1000}s ease, ` +
								`box-shadow ${duration / 1000}s linear 0.1s`;
		to.style.transform = "";
		to.style.borderRadius = "";
		to.style.background = "";
		to.style.boxShadow = "";
	});
	// Clean up after the animation is done and call our callback
	_.delay(() => {
		to.style.transition = "";
		to.style.transformOrigin = "";
		if (useClone){
			originalNode.style.visibility = originalVis;
			to.remove();
		}
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
				data.element.style.visibility = "hidden";
				// Store the reference to the element on the DOM node itself,
				// since Blaze won't keep the data around for the remove hook
				node["data-element"] = data.element;
				heroAnimate({from: data.element, to: node});
			}
		},
		remove: function(node, tpl) {
			const element = node["data-element"];
			if (element){
				element.style.visibility = "";
				heroAnimate({from: node, to: element, useClone: true});
				node.remove();
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
