admins = ['hzhang', 'kchen', 'jshi'];

People = new Mongo.Collection("people");
People.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    const username = Meteor.users.findOne(userId).username;
    return username === doc._id || admins.indexOf(username) !== -1;
  },
  remove: function (userId, doc) {
    const username = Meteor.users.findOne(userId).username;
    return admins.indexOf(username) !== -1;
  }
});

Projects = new Mongo.Collection("projects");
Projects.allow({
  insert: function (userId, doc) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
  },
  update: function (userId, doc, fields, modifier) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
  },
  remove: function (userId, doc) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
  }
});

Sigs = new Mongo.Collection("sigs");
Sigs.allow({
  insert: function (userId, doc) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
  },
  update: function (userId, doc, fields, modifier) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
  },
  remove: function (userId, doc) {
    const username = Meteor.users.findOne(userId).username;
    return doc.people.indexOf(username) !== -1 || admins.indexOf(username) !== -1;
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
