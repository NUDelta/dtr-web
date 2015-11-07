Template.sigEdit.helpers({
    sigProjectsList: function(){
	return Projects.find(
	    {
		_id : {$in: this.projects}
	    }
	);
    },
    notSigProjectsList: function(){
	return Projects.find(
	    {
		_id : {$not: {$in: this.projects}}
	    }
	);
    },
    sigPeopleList: function(){
	return People.find(
	    {
		_id : {$in: this.people}
	    }
	);
    },
    notSigPeopleList: function(){
	return People.find(
	    {
		_id : {$not: {$in: this.people}}
	    }
	);
    }


});

Template.sigEdit.events({ 
    'submit form': function(e) {
	e.preventDefault();

	var currentSigId = this._id;
	var sigProperties = {
	    title: $(e.target).find('[name=title]').val(),  
	    about: $(e.target).find('[name=about]').val(),  
	    banner: $(e.target).find('[name=banner]').val(),  
//	    projects: $.makeArray($('#projects:checked').map(function() { return this.value;})),
// projects are tricky: need to update it in the project collection too..
	    people: $.makeArray($('#people:checked').map(function() { return this.value;}))
	}
	


	Sigs.update(currentSigId, {$set: sigProperties},
		     function(error) { 
		     	  if (error) {
		     	      // display the error to the user
		     	      alert(error);
		     	      alert(error.reason); 
		     	  } else {
		     	      Router.go('Projects');
		     	  }
		     });
    },
    'click .delete': function(e) { 
	e.preventDefault();
	if (confirm("Delete this SIG?")) { 
	    var currentSigId = this._id; 
	    Sigs.remove(currentSigId); 
	    Router.go('Projects');
	} 
    }
});
