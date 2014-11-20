_.each(Template, function (template, name) {
	if(template){
		var counter = 0;
		template.rendered = template.rendered || function () {
			console.log(name, "render count: ", ++counter);
		};
	}
});