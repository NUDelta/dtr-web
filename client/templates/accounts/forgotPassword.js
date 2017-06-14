Template.forgotPassword.events({
    'submit form': function(e) {
        e.preventDefault()
        var email = $('#forgot-password-email').val()
        if (email === '') {
            console.log('no email');
        } else {
            Accounts.forgotPassword({email: email}, function(err) {
                if (err !== undefined) {
                    alert('Oops! Something went wrong. Please check your email and try again.')
                } else {
                    alert('Success! Please check your email.')
                }
            })
        }
    },
});
