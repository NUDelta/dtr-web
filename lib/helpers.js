if (Meteor.isClient) {
    Template.navItems.helpers({
	activeIfTemplateIs: function () {
	    
	    var currentRoute = Router.current();

	    console.log(arguments);

	    for (var i = 0; i < arguments.length; i++) {
	    	console.log(arguments[i]);
	    	if (arguments[i] === currentRoute.lookupTemplate() ? 'active' : '')
	    		return 'active';
	    }
	    return '';
	}
    });
}
