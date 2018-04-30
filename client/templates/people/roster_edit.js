Template.rosterEdit.helpers({
  people: function () {

    return People.find().fetch().sort(function(x, y) {
      if (computeWorth(y) !== computeWorth(x)) {
        return computeWorth(y) - computeWorth(x);
      }
      else {
        const A = x.name.toLowerCase();
        const B = y.name.toLowerCase();
        if (A < B){
          return -1;
        }
        else if (A > B){
          return  1;
        }
        else{
          return 0;
        }
      }
    }).filter(function(x) { return computeWorth(x) > 0 })
  },
  addPhotoLink: function () {
    let photoLink = Session.get('add-photo-thumbnail');
    if (!photoLink) {
      return "http://images.wisegeek.com/green-frog.jpg";
    }
    else {
      return photoLink;
    }
  }
});

Template.rosterEdit.events({
  'change .existing input, change .existing textarea': function (e) {
    const attribute = e.currentTarget.name;
    const value = e.currentTarget.value;
    const update = {};
    update[attribute] = value;

    const _id = $(e.currentTarget).parents('.person-card').data('id');
    People.update(_id, {$set: update});
  },
  'change #add-photo-link': function (e) {
    Session.set('add-photo-thumbnail', e.currentTarget.value);
  },
  'click .existing .glyphicon-remove': function (e) {
    if (confirm("Delete this person?")) {
      People.remove($(e.currentTarget).data('id'));
    }
  },
  'submit form': function(e) {
    e.preventDefault();

    const person = {
      name: e.currentTarget.name.value,
      role: e.currentTarget.role.value,
      description: e.currentTarget.description.value,
      photoLink: e.currentTarget.photoLink.value,
      _id: firstInitialLastName(e.currentTarget.name.value)
    };
    People.insert(person);
    Session.set('add-photo-thumbnail', '');
    e.currentTarget.reset();
  }
});

const firstInitialLastName = function (name){
  const lastName = name.split(" ");
  return (name[0] + lastName[lastName.length - 1]).toLowerCase()
};

Template.rosterEdit.rendered = function () {
  Session.set('add-photo-thumbnail', '');
  const availableTags = [
    'PhD Student',
    'Undergrad Researcher',
    'Collaborator',
    'Alumni'
  ];

  $('.person-title').autocomplete({
    source: availableTags
  });

};

const computeWorth = function (person) {
  if (person._id === 'hzhang') {
    return 10;
  }
  else if (person._id === 'lgerber') {
    return 9;
  }
  else if (person.role.toLowerCase() === 'phd student') {
    return 8;
  }
  else if (person.role.toLowerCase() === 'undergrad researcher') {
    return 7;
  }
  else if (person.role.toLowerCase() === 'top dog') {
    return 6;
  }
  else if (person.role.toLowerCase() === 'alumni') {
    return 5;
  }
  else if (person.role.toLowerCase() === 'collaborator') {
    return 0; // don't display them
  }
  else {
    return 1;
  }
};
