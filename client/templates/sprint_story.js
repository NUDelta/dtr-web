Template.sprintStory.helpers({
	tasks: function() {
		return Tasks.find({storyId: this._id});
	},
	autosize: function() {
		Meteor.defer(function() {
			$('textarea').autosize().show().trigger('autosize.resize');
		});
	}
});

Template.sprintStory.events({
	'keydown textarea.form-story': function(e) {
		if (e.which == 13) {
			e.preventDefault();
			var nextTextarea = $('textarea')[$('textarea').index(e.target)+1];
			if (nextTextarea) {
				nextTextarea.focus();
			}
		}
	},
	'keyup textarea.form-story': function(e) {
		Stories.update(this._id, {$set: {description: e.target.value}});
	},
	'focus textarea.form-add-task': function(e) {
		Tasks.insert({
			storyId: this._id,
			project: this.project,
			index: Tasks.find({storyId: this._id}).count()+1,
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
		console.log('hi');
	}
});