if (Meteor.isClient) {
    Template.navItems.helpers({
        activeIfTemplateIs: function() {

            var currentRoute = Router.current();

            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] === currentRoute.lookupTemplate()
                    ? 'active'
                    : '')
                    return 'active';
                }
            return '';
        }
    });
}
