Template.login.events({
	'click input': function(e) {
		console.log('hi');
		e.stopPropagation();
	},
	'submit form': function(e) {
		e.preventDefault();
		var username = $('#login-username').val(),
		password = $('#login-password').val();
		if (username === '' || password === '') {
			alert('Please fill in all fields.');
			return;
		}
		Meteor.loginWithPassword(username, password, function (res, err) {
			if (err) {
				alert('could not log you in');
			}
		});
	},
	'click #logout-button': function(e) {
		Meteor.logout();
	},
});

Template.login.helpers({
	'loggedIn': function() {
		return !!Meteor.user();
	}
})