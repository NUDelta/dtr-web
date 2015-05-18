Template.sigSubmit.events({ 'submit form': function(e) {
    e.preventDefault();
    var sig = {
        _id: "sig_" + $(e.target).find('[name=shortname]').val(),  
	title: $(e.target).find('[name=title]').val(),  
	about: $(e.target).find('[name=about]').val(),  
	banner: $(e.target).find('[name=banner]').val(),   
	projects: [],
	people: []
    };
    sig._id = Sigs.insert(sig);
    Router.go('Projects');
}});
