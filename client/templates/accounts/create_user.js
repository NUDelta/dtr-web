Template.createUser.events({
    'submit form': function(e) {
        e.preventDefault();
        var fullname = $('#create-name').val(),
            username = $('#create-username').val(),
            password = $('#create-password').val(),
            email = $('#create-email').val();

        var accountId = Accounts.createUser({
            'username': username,
            'password': password,
            'email': email
        }, function(err) {
            if (typeof err === 'undefined') {
                alert('account created');
                console.log('account created');
                //account created successfully you might want to send an email to the user using Account.sendEnrollmentEmail()

                People.insert({_id: username, name: fullname, role: "", photoLink: "", description: ""})
            } else {
                console.log(err);
            }
        });
    }
})
