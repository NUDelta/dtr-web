Template.Projects.helpers({
  sigs: function() {
    return Sigs.find();
  },

  sig_project: function(sig_id) {
  	return Projects.find({sig: sig_id});
  }
});
