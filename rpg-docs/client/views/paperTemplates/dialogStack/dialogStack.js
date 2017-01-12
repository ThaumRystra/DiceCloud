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
	dialogStackStyle(){
		if (!dialogs.get().length) return "display: none;";
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

Template.dialogStack.uihooks({
	".dialog": {
		container: ".dialog-sizer",
		insert: function(node, next, tpl) {
      		$(node).insertBefore(next);

			const data = Blaze.getData(node);
			if (data.element){
				data.element.style.visibility = "hidden";
				const toRect = node.getBoundingClientRect();
				const fromRect = data.element.getBoundingClientRect();
				const deltaLeft = fromRect.left - toRect.left;
				const deltaTop = fromRect.top - toRect.top;
				const deltaWidth = fromRect.width / toRect.width;
				const deltaHeight = fromRect.height / toRect.height;
				node.style.transition = "none";
				node.style.transform = `translate(${deltaLeft}px, ${deltaTop}px) ` +
					`scale(${deltaWidth}, ${deltaHeight})`;
				node.style.borderRadius = $(data.element).css("border-radius");
				node["data-element"] = data.element;
				_.defer(() => {
					node.style.transition = "";
					node.style.transform = "";
					node.style.borderRadius = "";
				});
			}
		},
		remove: function(node, tpl) {
			//TODO maybe make the element transform to the dialog size
			//     and then return to its place?
			const element = node["data-element"];
			if (element){
				const toRect = node.getBoundingClientRect();
				const fromRect = element.getBoundingClientRect();
				let deltaLeft = fromRect.left - toRect.left;
				let deltaTop = fromRect.top - toRect.top;
				const deltaWidth = fromRect.width / toRect.width;
				const deltaHeight = fromRect.height / toRect.height;
				node.style.transform = `translate(${deltaLeft}px, ${deltaTop}px) ` +
					`scale(${deltaWidth}, ${deltaHeight})`;
				node.style.borderRadius = $(element).css("border-radius");
				_.delay(() => {
					element.style.visibility = "";
					node.remove();
				}, 500);
			} else {
				node.remove();
			}
		}
	}
});

Template.testDialog.events({
	"click .testButton": function(event, template){
		pushDialogStack({template: "testDialog", element: event.currentTarget, data: Random.id()});
	}
})
