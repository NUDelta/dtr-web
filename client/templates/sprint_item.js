Template.sprintItem.helpers({
	stories: function() {
		return Stories.find({sprintId: this._id});
	}
})