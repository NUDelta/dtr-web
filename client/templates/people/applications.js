Template.applications.helpers({
    applications: function() {
        return Apps.find();
    }
});

Template.applications.events({
    'click .master-collapser': function(event, template) {
        $(event.currentTarget).parent().nextAll('.collapseable').slideToggle(600);
    },
    'click .collapser': function(event, template) {
        $(event.currentTarget).next('.collapseable').slideToggle(600);
    }
});
