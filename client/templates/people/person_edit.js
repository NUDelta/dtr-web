Template.personEdit.events({ 
    'submit form': function(e) {
	e.preventDefault();
	var currentPersonId = this._id;
	var personProperties = {
	    name: $(e.target).find('[name=name]').val(),  
	    role: $(e.target).find('[name=role]').val(),  
	    description: $(e.target).find('[name=description]').val(),  
	    photoLink: $(e.target).find('[name=link]').val(),  
	}
	People.update(currentPersonId, {$set: personProperties}, 
		      function(error) { 
			  if (error) {
			      // display the error to the user
			      alert(error.reason); 
			  } else {
			      Router.go('People');
			  }
		      });
    },
    'click .delete': function(e) { 
	e.preventDefault();
	if (confirm("Delete this person?")) { 
	    var currentPersonId = this._id; 
	    People.remove(currentPersonId); 
	    Router.go('People');
	} 
    }
});
