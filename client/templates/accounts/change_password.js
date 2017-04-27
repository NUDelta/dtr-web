Template.changePassword.helpers({
    hasVerifiedEmail: function() {
        if (Meteor.user() && 'emails' in Meteor.user()) {
            return Meteor.user().emails.filter(function(x) {
                return x.verified == true
            }).length > 0
        } else {
            return false
        }
    }
})

Template.changePassword.events({
    'submit #add-email-form': function(e) {
        e.preventDefault();
        var email = $('#email').val();
        Meteor.call("addEmail", email, function(err) {
            if (typeof err === 'undefined') {
                console.log("email added")
                Meteor.call("sendVerificationEmail", email, function(err) {
                    if (typeof err === 'undefined') {
                        console.log("verification email sent")
                        alert("We just sent you a verification email. If you didn't get it, please let the webmaster know.")
                    } else {
                        console.log(err)
                    }
                })
            } else {
                console.log(err)
            }
        })
    },
    'submit #change-password-form': function(e) {
        e.preventDefault();

        var oldPassword = $('#old-password').val(),
            newPassword = $('#new-password').val();
        Accounts.changePassword(oldPassword, newPassword, function(err) {
            if (typeof err === 'undefined') {
                console.log('password changed');
                Router.go('/');
            } else {
                console.log(err);
            }
        });
    }
})
