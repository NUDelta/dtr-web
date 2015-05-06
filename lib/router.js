Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function(){
    this.route('Method');
    this.route('People');
    this.route('Projects');
    this.route('Resources');
    this.route('Apply');
    this.route('Faq');
    this.route('Sprint');
    this.route('Vision', { path: '/'});
    this.route('/Projects/:_id', {
    	name: "Project",
    	data: function() { return Projects.findOne("proj_" + this.params._id); }
    });
    
});

var requireLogin = function() {
    if (! Meteor.user()) {
        this.render('accessDenied');
    } else {
        this.next();
    }
}

Router.onBeforeAction(requireLogin, {only: 'Sprint'});

