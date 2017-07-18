Template.registerHelper("characterPath", function(char) {
	return `\/character\/${char._id}\/${char.urlName || "-"}`;
});
