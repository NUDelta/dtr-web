People = new Mongo.Collection("people");
Projects = new Mongo.Collection("projects");
Sigs = new Mongo.Collection("sigs");
Sprints = new Mongo.Collection("sprints");
Stories = new Mongo.Collection("stories");
Tasks = new Mongo.Collection("tasks");
Tasks.allow({
	insert: function() {
		return true;
	}
});


