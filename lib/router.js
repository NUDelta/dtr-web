Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function(){
    this.route('Method');
    this.route('People');
    this.route('Projects');
    this.route('Resources');
    this.route('Vision', { path: '/'});
    this.route('/Projects/:_id', {
    	name: "Project",
    	data: function() { return Projects.findOne(this.params._id); }
    });
    
});

