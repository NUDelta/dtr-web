Template.login.events({
    'keypress input': function(e) {
        $('.alert').hide()
    },
    'click input': function(e) {
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
        Meteor.loginWithPassword(username, password, function (err) {
            if (err !== undefined) {
                $('.alert').show()
            }
        });
    },
    'click #logout-button': function(e) {
        Meteor.logout();
    }
});

Template.login.helpers({
    'loggedIn': function() {
        return !!Meteor.user();
    },
    'isAdmin': function(){
        return Meteor.user().username == 'hzhang';
    }
})
