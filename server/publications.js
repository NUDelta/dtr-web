Meteor.publish('people', function() {
	return People.find();
});

Meteor.publish('projects', function() {
	return Projects.find();
});

Meteor.publish('sigs', function() {
	return Sigs.find();
});

Meteor.publish('sprints', function(proj) {
	return Sprints.find({project: proj});
});

Meteor.publish('stories', function(proj) {
	return Stories.find({project: proj});
});

Meteor.publish('tasks', function(proj) {
	return Tasks.find({project: proj});
});