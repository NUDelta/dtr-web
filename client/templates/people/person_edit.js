Template.personEdit.events({
	'change input, change textarea': function (e) {
		var attribute = e.currentTarget.name;
		var value = e.currentTarget.value;
		var update = {}
		update[attribute] = value;

		People.update(this.person._id, {$set: update});
	} 
});

Template.personEdit.helpers({
    shorten: function (name) {
        // strips proj_
        return name.substring(5);
    }
});