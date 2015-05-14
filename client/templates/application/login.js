Template.login.events({
	'click input': function(e) {
		console.log('hi');
		e.stopPropagation();
	},
	'click #login-buttons-password': function(e) {
		var username = $('#login-username').val(),
		password = $('#login-password').val();
		console.log(username);
		console.log(password);
		if (username === '' || password === '') {
			alert('Please fill in all fields.');
			return;
		}
		Meteor.loginWithPassword(username, password);
	}
});