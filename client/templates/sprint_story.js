Template.sprintStory.helpers({
	tasks: function() {
		return Tasks.find({storyId: this._id});
	}
});

Template.sprintStory.events({
	'keyup input': function(e) {
		Stories.update(this._id, {$set: {description: e.target.value}});
	}
});