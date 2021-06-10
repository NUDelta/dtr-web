Template.sigSubmit.events({
  'submit form': function(e) {
    e.preventDefault();
    let sig = {
      _id: "sig_" + $(e.target).find('[name=shortname]').val(),
      title: $(e.target).find('[name=title]').val(),
      about: $(e.target).find('[name=about]').val(),
      banner: $(e.target).find('[name=banner]').val(),
      projects: [],
      people: []
    };

    Sigs.insert(sig, function (error) {
      if (error) {
        // TODO: create a useful error
        alert(error);
      } else {
        alert("New SIG created successfully!");
      }
    });
  }
});