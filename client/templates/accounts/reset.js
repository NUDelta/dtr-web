Accounts.onResetPasswordLink(function(token, done) {
    Accounts.resetPassword(token, 'password', function(err) {
        alert('Your password has been successfully reset to `password` and you will be logged in. Please change your password.')
    })
});
