admins = ['hzhang', 'kchen', 'jshi'];

People = new Mongo.Collection("people");
People.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        var username = Meteor.users.findOne(userId).username;
        if (username === doc._id || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    },
    remove: function (userId, doc) {
        var username = Meteor.users.findOne(userId).username;
        if (admins.indexOf(username) !== -1) {
            return true;
        }
    }
});

Projects = new Mongo.Collection("projects");
Projects.allow({
    insert: function (userId, doc) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    },
    update: function (userId, doc, fields, modifier) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    },
    remove: function (userId, doc) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }
});

Sigs = new Mongo.Collection("sigs");
Sigs.allow({
    insert: function (userId, doc) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    },
    update: function (userId, doc, fields, modifier) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    },
    remove: function (userId, doc) {
        var username = Meteor.users.findOne(userId).username;
        if (doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1) {
            return true;
        }
        else {
            return false;
        }
    }
});

GlobalSprints = new Mongo.Collection("globalSprints");
GlobalSprints.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Sprints = new Mongo.Collection("sprints");
Sprints.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Stories = new Mongo.Collection("stories");
Stories.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Tasks = new Mongo.Collection("tasks");
Tasks.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});

Apps = new Mongo.Collection('applications');
Apps.allow({
    insert: function() {
        return true;
    },
    update: function() {
        return true;
    },
    remove: function() {
        return true;
    }
});
