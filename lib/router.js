Router.configure({
  layoutTemplate: 'layout'
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
            return [Meteor.subscribe('projects'), Meteor.subscribe('sigs')];
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
        /*waitOn: function() {
            return [IRLibLoader.load('http://code.highcharts.com/highcharts.js')];
        }*/
    });
    this.route('Sprint/Projects/:proj', {
        template: 'Sprint',
        waitOn: function() {
            return [Meteor.subscribe('sprints', this.params.proj),
                    Meteor.subscribe('stories', this.params.proj),
                    Meteor.subscribe('tasks', this.params.proj)];
        }
        /*data: function() {
            console.log(Sprints.find({project: "proj_"+ this.params.proj}).count());
            return Sprints.find({project: "proj_"+ this.params.proj});
        }*/
    });
    this.route('Vision', { path: '/'});
    this.route('/Projects/:_id', {
    	name: "Project",
    	data: function() { return Projects.findOne("proj_" + this.params._id); }
    });
    
});

/*Router.onBeforeAction(requireLogin, {only: 'Sprint'});*/

