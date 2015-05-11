Template.sprintStory.helpers({
	tasks: function() {
		return Tasks.find({storyId: this._id});
	}
})