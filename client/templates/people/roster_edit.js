Template.rosterEdit.helpers({
    people: function () {
        return People.find();
    },
    addPhotoLink: function () {
        var photoLink = Session.get('add-photo-thumbnail');
        if (!photoLink) {
            return "http://images.wisegeek.com/green-frog.jpg";
        }
        else {
            return photoLink;
        }
    }
});

Template.rosterEdit.events({
    'change .existing input, change .existing textarea': function (e) {
        var attribute = e.currentTarget.name;
        var value = e.currentTarget.value;
        var update = {}
        update[attribute] = value;

        var _id = $(e.currentTarget).parents('.person-card').data('id');
        People.update(_id, {$set: update});
    },
    'change #add-photo-link': function (e) {
        Session.set('add-photo-thumbnail', e.currentTarget.value);
    },
    'click .existing button[type=delete]': function (e) {
        if (confirm("Delete this person?")) {
            People.remove($(e.currentTarget).data('id'));
        }
    },
    'submit form': function(e) {
        e.preventDefault();
        var person = {
            name: e.currentTarget.name.value,  
            role: e.currentTarget.role.value,  
            description: e.currentTarget.description.value,  
            photoLink: e.currentTarget.photoLink.value,  
        };
        People.insert(person);
        Session.set('add-photo-thumbnail', '');
        e.currentTarget.reset();
    } 
 });

Template.rosterEdit.rendered = function () {
    Session.set('add-photo-thumbnail', '');
    var availableTags = [
        'PhD Student',
        'Undergrad Researcher',
        'Alumni'
    ];
    $('.person-title').autocomplete({
        source: availableTags
    });
};