Accounts.onEmailVerificationLink(function(token, done) {
    Accounts.verifyEmail(token, function(err) {
        if (typeof err === 'undefined') {
            alert("Your email has been verified. Thank you.")
        } else {
            console.log("something went wrong with verifying the email...")
        }
    })
});
