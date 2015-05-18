Template.sprintStory.helpers({
	tasks: function() {
		return Tasks.find({storyId: this._id});
	}
});

Template.sprintStory.events({
	'keyup input.form-story': function(e) {
		Stories.update(this._id, {$set: {description: e.target.value}});
	},
	'focus input.form-add-task': function(e) {
		Tasks.insert({
			storyId: this._id,
			project: this.project,
			description: '',
			people: [],
			points: 1,
			D: false,
			T: false,
			R: false
		});
		$(e.target).closest('form').find('.form-task').last().focus();
	},
	'click .remove-story': function(e) {
		var tasksCursor = Tasks.find(),
		storyId = this._id,
		task;
		tasksCursor.forEach(function(task) {
			if (task.storyId === storyId) {
				Tasks.remove(task._id);
			}
		});
		Stories.remove(this._id);
	},
	'keyup textarea': function(e) {
		var needed_rows = Math.floor(e.currentTarget.value.length / 68) + 1;
		$(e.currentTarget).attr('rows', needed_rows);
	}
});