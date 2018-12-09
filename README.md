# DTR Website

## Development
1. Create a `settings.dev.json` file in the root directory with the following info:
    ```
    {
      "private": {
        "gmailKey": "NUDELTA GMAIL PASSWORD HERE"
      },
      "public": {
    
      }
    }
    ```
2. Run `meteor --settings settings.dev.json` to start the local meteor server. View the local DB using `meteor mongo`.

## Deploy Information

### Vitals

- Machine IP: _192.241.188.11_
- Web Url: <http://dtr.northwestern.edu>
- Service: DigitalOcean
- Login Info: message Kapil on Slack

### SSHing into the machine:
You must have your key added to the DigitalOcean droplet before you can connect to the machine or deploy. 

1. Login and add your SSH key to our [DigitalOcean account](https://cloud.digitalocean.com/settings/security). If you haven't generated an SSH key before, see [this](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys--2).
2. Ask someone with root access (as of now, Kapil or Haoqi) to add you to the authorized SSH users (see below).
3. Run `ssh root@dtr.northwestern.edu` to log into the machine.



#### Adding a user's ssh key
1. Get the user's key and download it. Rename the file as `person_rsa.pub`.
2. Run `cat ./person_rsa.pub | ssh root@192.241.188.11 "cat >> ~/.ssh/authorized_keys"` to add the key. (Note that you must already have SSH access to add a key).

### Deploying
We use [Meteor Up](http://meteor-up.com/) to build and deploy the DTR Website.
1. Install [Meteor Up](http://meteor-up.com/getting-started.html) globally.
2. Navigate to `.deploy` using `cd .deploy`.
3. Copy the settings file created above for deployment and add it to the `.deploy` directory with the name, `settings.json`. 
2. Run `mup deploy` to deploy 

### TODOs
- Test if emails are working properly
