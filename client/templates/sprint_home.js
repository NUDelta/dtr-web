Template.sprintHome.helpers({
	projects: function() {
		console.log(Projects.find().count());
		return Projects.find();
	}
})