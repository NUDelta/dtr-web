Template.personEdit.events({
  'change input, change textarea': function (e) {
    const attribute = e.currentTarget.name;
    const value = e.currentTarget.value;
    const update = {};
    update[attribute] = value;

    People.update(this.person._id, {$set: update});
  },
  'click .projects-list-item .glyphicon-edit, click .projects-list-item .glyphicon-ok, click .projects-list-item h4': function (e) {
    // get the id of the project edit button was clicked on
    const id = e.currentTarget.getAttribute('data-toggle');

    // toggle edit/checkmark button and content
    let transitionLength = 500;
    $('span#' + id).fadeToggle(transitionLength);
    $('div#' + id).slideToggle(transitionLength);
  },
  'click .projects-list-item .glyphicon-trash': function (e) {
    const id = e.currentTarget.getAttribute('data-toggle');
    if (confirm('Are you sure you want to delete this project? This action is permanent.')) {
      Projects.remove(id);
      Sigs.find().forEach(function (sig) {
        if (sig.projects.indexOf(id) !== -1) {
          Sigs.update(sig, { $pull: { projects: id } } );
        }
      })
    }
  },
  'submit #add-new-project-form': function (e) {
    e.preventDefault();
    const name = e.target.projectname.value;
    const sig = e.target.signame.value;
    const new_id = 'proj_' + name.toLowerCase().replace(/\s/g, '_');

    if (Projects.findOne(new_id)) {
      alert('A project already exists with this name!');
    }
    else {
      let sig_id = Sigs.findOne({ title: sig });
      if (!sig_id) {
        alert('That SIG does not exist. Please pick one that does!');
      }
      else {
        const new_proj = {
          _id: new_id,
          sig: sig_id._id,
          title: name,
          people: [Meteor.user().username],
          about: "",
          banner: "",
          images: [{}],
          publications: [],
          design_log: "",
        };
        Projects.insert(new_proj, function (err, res) {
          if (err) {
            alert(err);
          }
          else {
            Sigs.update(sig_id._id, {$push: {projects: new_proj._id}})
          }
        });
        e.currentTarget.reset();
      }
    }
  }
});

Template.personEdit.helpers({
  shorten: function (name) {
    // strips proj_
    return name.substring(5);
  },
  isAdmin: function() {
    // fetch the current person
    let currPerson = People.findOne(Meteor.user().username);

    // check if person is either an admin or a phd student
    let isAdmin = admins.includes(currPerson._id);
    let isPhDStudent = currPerson.role.toLowerCase() === "phd student";
    return isAdmin || isPhDStudent;
  },
  getProfilePic: function() {
    // fetch the current person
    let currPerson = People.findOne(Meteor.user().username);
    return currPerson.photoLink !== "" ? currPerson.photoLink : "/images/default-pic.png";
  }
});

Template.personEdit.rendered = function () {
  const sigs = [];
  Sigs.find().forEach(function (sig) {
    sigs.push(sig.title);
  });

  $('#add-new-project-sig').autocomplete({
    source: sigs
  });
};
