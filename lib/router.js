Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function(){
    this.route('Method');
    this.route('People');
    this.route('Projects');
    this.route('Resources');
    this.route('Vision', { path: '/'});
    
});

