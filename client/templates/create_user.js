Template.createUser.events({
	'submit form': function(e) {
		e.preventDefault();
		console.log('hi');
		var username = $('#create-username').val(),
		password = $('#create-password').val();
		var accountId = Accounts.createUser({
		  'username'  : username,
		  'password'  : password
		}, function(err){
		  if(typeof err === 'undefined'){
		    console.log('account created');
		    //account created successfully you might want to send an email to the user using Account.sendEnrollmentEmail()
		  }
		  else {
		  	console.log(err);
		  }
		});
	}
})