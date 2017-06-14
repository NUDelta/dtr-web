Router.configure({layoutTemplate: 'layout', loadingTemplate: 'loading'});

Router.map(function() {
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
            return [Meteor.subscribe('projects'), Meteor.subscribe('sigs')];
        }
    });
    this.route('Sprint/Projects/:proj/latest', {
        template: 'Sprint',
        data: function() {
            var current = Sprints.find({
                project: this.params.proj,
                startdate: {
                    $lte: new Date()
                },
                enddate: {
                    $gte: new Date()
                }
            });
            if (current.count() == 0) { // return latest
                return Sprints.findOne({
                    project: this.params.proj
                }, {
                    sort: {
                        startdate: -1
                    },
                    limit: 1
                });
            }
            return Sprints.findOne({
                project: this.params.proj,
                startdate: {
                    $lte: new Date()
                },
                enddate: {
                    $gte: new Date()
                }
            });
        },
        waitOn: function() {
            return [
                Meteor.subscribe('sprints', this.params.proj),
                Meteor.subscribe('stories', this.params.proj),
                Meteor.subscribe('tasks', this.params.proj),
                Meteor.subscribe('people', this.params.proj),
                Meteor.subscribe('projects', this.params.proj)
            ];
        }
    });
    this.route('projectSprint', {
        path: '/Sprint/Projects/:proj/:_id',
        template: 'Sprint',
        data: function() {
            return Sprints.findOne(this.params._id)
        },
        waitOn: function() {
            return [
                Meteor.subscribe('sprints', this.params.proj),
                Meteor.subscribe('stories', this.params.proj),
                Meteor.subscribe('tasks', this.params.proj),
                Meteor.subscribe('people', this.params.proj),
                Meteor.subscribe('projects', this.params.proj)
            ];
        }
    });
    this.route('Sprint/Projects/:proj/People', {
        template: 'sprintPeople',
        waitOn: function() {
            return [
                Meteor.subscribe('sprints', this.params.proj),
                Meteor.subscribe('people', this.params.proj),
                Meteor.subscribe('projects')
            ];
        }
    })
    this.route('Vision', {path: '/'});
    this.route('/Projects/:_id', {
        name: "Project",
        data: function() {
            return Projects.findOne("proj_" + this.params._id);
        },
        waitOn: function() {
            return [Meteor.subscribe('projects'), Meteor.subscribe('people')];
        }
    });
    this.route('create_user', {template: 'createUser'});

    this.route('change_password', {template: 'changePassword'});

    this.route('/Sigs/AddSig', {name: 'sigSubmit'});
    this.route('/Sigs/:_id/edit', {
        name: 'sigEdit',
        data: function() {
            return Sigs.findOne(this.params._id);
        },
        waitOn: function() {
            return [Meteor.subscribe('sigs'), Meteor.subscribe('projects'), Meteor.subscribe('people')];
        }

    });

    this.route('/People/AddPerson', {name: 'personSubmit'});
    this.route('/People/:_id/edit', {
        name: 'personEdit',
        data: function() {
            if (this.params._id === 'hzhang') { // HQ sees all
                return {
                    person: People.findOne(this.params._id),
                    projects: Projects.find(),
                    sigs: Sigs.find()
                }
            } else {
                return {
                    person: People.findOne(this.params._id),
                    projects: Projects.find({people: this.params._id})
                }
            }
        },
        waitOn: function() {
            return [Meteor.subscribe('people'), Meteor.subscribe('projects'), Meteor.subscribe('sigs')];
        }
    });
    this.route('/Sprint/edit', {
        name: 'sprintEdit',
        waitOn: function() {
            return [Meteor.subscribe('sprints'), Meteor.subscribe('globalSprints'), Meteor.subscribe('projects')];
        }
    });
    this.route('/People/edit', {
        name: 'rosterEdit',
        waitOn: function() {
            return [Meteor.subscribe('people')];
        }
    });
    this.route('/People/applications', {
        name: 'applications',
        waitOn: function() {
            return [Meteor.subscribe('applications')];
        }
    });
    this.route('forgot-password');
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

Router.onBeforeAction(requireLogin, {
    only: ['Sprint/Projects/:proj', 'Sprint', 'personEdit', 'rosterEdit', 'applications']
});
