Template.sprintItem.onRendered(function() {
	var storiesCursor = Stories.find(),
	story;
	storiesCursor.forEach(function(story) {
		console.log(document.getElementById('sortable-' + story._id));
		Sortable.create(document.getElementById('sortable-' + story._id), {
			handle: '.reorder-task',
			animation: 150
		});
	});
});

Template.sprintItem.helpers({
	stories: function() {
		return Stories.find({sprintId: this._id});
	},
	printDateRange: function() {
		var range = [new Date(this.range[0]), new Date(this.range[1])],
		days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		return days[range[0].getDay()] + ', ' + (range[0].getMonth()+1) + '/' + range[0].getDate() + ' to ' +
				days[range[1].getDay()] + ', ' + (range[1].getMonth()+1) + '/' + range[1].getDate();
		
	},
	printName: function(personId) {
		return People.findOne(personId).name;
	},
	personPoints: function(personId) {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.people.indexOf(personId) !== -1) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	pointsGroup: function(sprintId) {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			points = points + parseInt(task.points);
		});
		return points;
	},
	personPointsD: function(personId) {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.people.indexOf(personId) !== -1 && task.D) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	personPointsT: function(personId) {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.people.indexOf(personId) !== -1 && task.T) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	personPointsR: function(personId) {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.people.indexOf(personId) !== -1 && task.R) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	groupPointsD: function() {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.D) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	groupPointsT: function() {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.T) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	groupPointsR: function() {
		var points = 0,
		tasksCursor = Tasks.find(),
		task;
		tasksCursor.forEach(function(task) {
			if (task.R) {
				points = points + parseInt(task.points);
			}
		});
		return points;
	},
	stage1: function() {
		return Sprints.findOne().stage === "1";
	},
	stage2: function() {
		return Sprints.findOne().stage === "2";
	},
	stage3: function() {
		return Sprints.findOne().stage === "3";
	}

});

Template.sprintItem.events({
	'focus input.form-add-story': function(e) {
		Stories.insert({
			'project': this.project,
			'sprintId': this._id,
			'description': '',
			'people': []
		});
		$('.form-story').last().focus();
	},
	'click .done-stage-1': function(e) {
		Sprints.update(this._id, {$set: {stage: "2"}});
	},
	'click .done-stage-2': function(e) {
		Sprints.update(this._id, {$set: {stage: "3"}});
	}
});