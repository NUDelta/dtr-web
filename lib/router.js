Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
});

Router.map(function(){
    this.route('Method');
    this.route('People', {
        waitOn: function() {
            return Meteor.subscribe('people');
        }
    });
    this.route('Projects', {
        waitOn: function() {
            return [Meteor.subscribe('projects'), Meteor.subscribe('sigs'), Meteor.subscribe('people')];
        }
    });
    this.route('Resources');
    this.route('Apply');
    this.route('Faq');
    this.route('Sprint', {
        template: 'sprintHome',
        waitOn: function() {
            return [Meteor.subscribe('projects'),
                    Meteor.subscribe('sigs')];
        }
    });
    this.route('Sprint/Projects/:proj', {
        template: 'Sprint',
        waitOn: function() {
            return [Meteor.subscribe('sprints', this.params.proj),
                    Meteor.subscribe('stories', this.params.proj),
                    Meteor.subscribe('tasks', this.params.proj),
                    Meteor.subscribe('people', this.params.proj),
                    Meteor.subscribe('projects', this.params.proj)];
        }
    });
    this.route('Sprint/Projects/:proj/People', {
        template: 'sprintPeople',
        waitOn: function() {
            return [Meteor.subscribe('sprints', this.params.proj),
                    Meteor.subscribe('people', this.params.proj),
                    Meteor.subscribe('projects')];
        }
    })
    this.route('Vision', { path: '/'});
    this.route('/Projects/:_id', {
    	name: "Project",
    	data: function() { return Projects.findOne("proj_" + this.params._id); },
        waitOn: function() {
            return [Meteor.subscribe('projects'), Meteor.subscribe('people')];
        }
    });
    this.route('create_user', {
        template: 'createUser'
    });

    this.route('/Sigs/AddSig', {name: 'sigSubmit'});
    this.route('/Sigs/:_id/edit', {
	name: 'sigEdit',
	data: function() { return Sigs.findOne(this.params._id); }
    });


    this.route('/People/AddPerson', {name: 'personSubmit'});
    this.route('/People/:_id/edit', {
    	name: 'personEdit',
    	data: function() {
            if (this.params._id === 'hzhang') {
                return {
                    person: People.findOne(this.params._id),
                    projects: Projects.find()
                }
            }
            else {
                return {
                    person: People.findOne(this.params._id),
                    projects: Projects.find({ people: this.params._id })
                }
            }
            },
        waitOn: function() {
            return [ Meteor.subscribe('people'),
                     Meteor.subscribe('projects'),
                     Meteor.subscribe('sigs') ];
        }
    });
    this.route('/People/edit', {
        name: 'rosterEdit',
        waitOn: function() {
            return [ Meteor.subscribe('people') ];
        }
    })

});

var requireLogin = function() {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
}

Router.onBeforeAction(requireLogin, {only: ['Sprint/Projects/:proj', 'Sprint', 'personEdit', 'rosterEdit']});

