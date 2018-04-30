if (Meteor.isClient) {
  Template.navItems.helpers({
    activeIfTemplateIs: function() {
      const currentRoute = Router.current();
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] === currentRoute.lookupTemplate() ? 'active' : '')
          return 'active';
      }

      return '';
    }
  });
}
