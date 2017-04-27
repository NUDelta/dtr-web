Meteor.publish('people', function() {
    return People.find();
});

Meteor.publish('applications', function() {
    return Apps.find();
});

Meteor.publish('projects', function(proj) {
    if (proj !== undefined)
        return Projects.find({_id: proj});
    else
        return Projects.find({}, {sort: {title: 1}});
});

Meteor.publish('sigs', function() {
    return Sigs.find();
});

Meteor.publish('globalSprints', function(){
    return GlobalSprints.find();
});
Meteor.publish('sprints', function(proj) {
    return Sprints.find({project: proj});
});

Meteor.publish('stories', function(proj) {
    return Stories.find({project: proj});
});

Meteor.publish('tasks', function(proj) {
    return Tasks.find({project: proj});
});
