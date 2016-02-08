DTR Website
==============

1. create settings.json that looks like this:

```
  {
         "gmailKey": "NUDELTA GMAIL PASSWORD HERE
  }
```

3. meteor run --settings settings.json

4. meteor deploy APP_NAME --settings settings.json

## Deploy Information

**Vitals:**
* Machine IP: _192.241.188.11_
* Web Url: http://dtr.northwestern.edu
* Service: DigitalOcean
* Login Info: message Kevin on Slack

**SSHing into the machine:**

1. Login and add your SSH key to our [DigitalOcean account](https://cloud.digitalocean.com/settings/security). If you haven't generated an SSH key before, see [this](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2).
2. Ask someone with root access (as of now, Kevin or Haoqi) to add you to the authorized SSH users. (Note to us: paste person's public ssh to a new line in `~/.ssh/authorized_keys`.
3. `ssh root@dtr.northwestern.edu`

You probably won't need to do this too often, but you won't be able to deploy without your SSH key added.

**Deploying:**

1. Make sure you don't track further changes to the mup.json (will screw others up). Use `git update-index --assume-unchanged mup.json`

2. Update the `app` property in `mup.json` to point to your current DTR directory.

3. `mup deploy` to deploy!

TODO: We need to test if emails are working properly.
