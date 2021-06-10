Template.Person.helpers({
  getProfilePic: function() {
    return this.photoLink !== "" ? this.photoLink : "/images/default-pic.png";
  }
});

