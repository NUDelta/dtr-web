People = new Mongo.Collection("people");
Projects = new Mongo.Collection("projects");
Sigs = new Mongo.Collection("sigs");
Sprints = new Mongo.Collection("sprints");
Sprints.allow({
	update: function() {
		return true;
	}
});
Stories = new Mongo.Collection("stories");
Stories.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return true;
	}
});
Tasks = new Mongo.Collection("tasks");
Tasks.allow({
	insert: function() {
		return true;
	},
	update: function() {
		return true;
	},
	remove: function() {
		return true;
	}
});


