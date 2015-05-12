Template.sprintTask.events({
	'keyup input': function(e) {
		Tasks.update(this._id, {$set: {description: e.target.value}});
	},
	'change select': function(e) {
		Tasks.update(this._id, {$set: {points: e.target.value}});
		$('#select-points option').removeAttr('selected');
		$('#select-points-' + this._id + ' option[value="' + this.points + '"]').attr('selected', 'selected');
	}
});

Template.sprintTask.rendered = function() {
	$('#select-points option').removeAttr('selected');
	var points = this.points;
	console.log(this._id);
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
	}
})