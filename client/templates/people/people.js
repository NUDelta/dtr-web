Template.People.helpers({
  people: function() {
    return People.find().fetch().sort(function(x, y) {
        if (computeWorth(y) !== computeWorth(x)) {
            return computeWorth(y) - computeWorth(x);
        }
        else {
            var A = x.name.toLowerCase();
            var B = y.name.toLowerCase();
            if (A < B){
               return -1;
            }else if (A > B){
              return  1;
            }else{
              return 0;
            }
        }
    });
  }
});

function computeWorth(person) {
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
    else if (person.role.toLowerCase() === 'alum') {
        return 6;
    }
    else {
        return 0;
    }
}