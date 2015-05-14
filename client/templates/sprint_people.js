Template.sprintPeople.helpers({
	sprints: function() {
		return Sprints.find();
	},
	printName: function(personId) {
		return People.findOne(personId).name;
	}
})