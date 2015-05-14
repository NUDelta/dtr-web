Template.sprintTask.events({
	'keyup input': function(e) {
		Tasks.update(this._id, {$set: {description: e.target.value}});
	},
	'change select': function(e) {
		Tasks.update(this._id, {$set: {points: e.target.value}});
		$('#select-points option').removeAttr('selected');
		$('#select-points-' + this._id + ' option[value="' + this.points + '"]').attr('selected', 'selected');
	},
	'click .remove-task': function(e) {
		Tasks.remove(this._id);
	},
	'click .toggle-DTR': function(e) {
		var toggle = $(e.target).data('toggle');
		console.log(toggle);
		switch (toggle) {
			case 'D':
				Tasks.update(this._id, {$set: {D: !this.D}});
				break;
			case 'T':
				Tasks.update(this._id, {$set: {T: !this.T}});
				break;
			case 'R':
				Tasks.update(this._id, {$set: {R: !this.R}});
				break;
		}
	},
	'click .btn-claim': function(e) {
		var username = Meteor.user().username,
		currentPeople = this.people;
		if (Projects.findOne().people.indexOf(username) === -1) {
			console.log('username not in project.');
		} else {
			currentPeople.push(username);
			Tasks.update(this._id, {$set: {people: currentPeople}});
		}
	},
	'click .btn-unclaim': function(e) {
		var username = Meteor.user().username,
		currentPeople = this.people,
		index = currentPeople.indexOf(username);
		if (index === -1) {
			console.log('user has not claimed this task.');
		} else {
			currentPeople.splice(index, 1);
			console.log(currentPeople);
			Tasks.update(this._id, {$set: {people: currentPeople}});
		}
	}
});

Template.sprintTask.rendered = function() {
	$('#select-points option').removeAttr('selected');
	var points = this.points;
	/*$('#select-points-' + this._id + ' option[value="' + points + '"]').attr('selected', 'selected');*/
	$('#select-points-task0 option[value=8]').attr('selected', 'selected');
};

Template.sprintTask.helpers({
	select1: function() {
		return this.points === '1' ? 'selected' : '';
	},
	select2: function() {
		return this.points === '2' ? 'selected' : '';
	},
	select3: function() {
		return this.points === '3' ? 'selected' : '';
	},
	select5: function() {
		return this.points === '5' ? 'selected' : '';
	},
	select8: function() {
		return this.points === '8' ? 'selected' : '';
	},
	select13: function() {
		return this.points === '13' ? 'selected' : '';
	},
	ownTask: function(taskId) {
		return Tasks.findOne(taskId).people.indexOf(Meteor.user().username) !== -1;
	},
	available: function(taskId) {
		return Tasks.findOne(taskId).people.length === 0 && Projects.findOne().people.indexOf(Meteor.user().username) !== -1;
	},
	initials: function(personId) {
		var fullName = People.findOne(personId).name,
		splitName = fullName.split(' '),
		initials = splitName[0][0]+splitName[1][0];
		return initials;
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
})