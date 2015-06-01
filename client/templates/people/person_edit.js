Template.personEdit.events({
	'change input, change textarea': function (e) {
		var attribute = e.currentTarget.name;
		var value = e.currentTarget.value;
		var update = {}
		update[attribute] = value;

		People.update(this.person._id, {$set: update});
	},
    'click .projects-list-item .glyphicon-minus': function (e) {
        var id = e.currentTarget.getAttribute('data-toggle');
        $('#' + id).slideToggle(600);
    },
    'click .projects-list-item .glyphicon-remove': function (e) {
        var id = e.currentTarget.getAttribute('data-toggle');
        if (confirm('Are you sure you want to delete this project?')) {
            Projects.remove(id);
        }
    },
    'submit #add-new-project-form': function (e) {
        console.log('hi');
        e.preventDefault();
        var name = e.target.projectname.value;
        var sig = e.target.signame.value;
        var new_id = 'proj_' + name.toLowerCase().replace(/\s/g, '_');

        if (Projects.findOne(new_id)) {
            alert('A project already exists with this name!');
        }
        else {
            var sig_id = Sigs.findOne({title: sig});
            if (!sig_id) {
                alert('That SIG does not exist. Please pick one that does!');
            }
            else {
                var new_proj = {
                    _id: new_id,
                    sig: sig_id._id,
                    title: name,
                    people: [Meteor.user().username],
                    about: "",
                    banner: "",
                    images: [{}],
                    pucliations: [],
                    design_log: "",
                };
                Projects.insert(new_proj);
                e.currentTarget.reset();
            }
        }
    }
});

Template.personEdit.helpers({
    shorten: function (name) {
        // strips proj_
        return name.substring(5);
    }
});
Template.personEdit.rendered = function () {
    var sigs = [];
    Sigs.find().forEach(function (sig) {
        sigs.push(sig.title)
    });
    $('#add-new-project-sig').autocomplete({
        source: sigs
    });
};