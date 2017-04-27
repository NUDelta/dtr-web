var thing;
for (var i in people) {
    thing = People.findOne(people[i]._id);
    if (!thing) {
        People.insert(people[i]);
    }
    // Create if entry doesn't exist. Otherwise, ignore.
    // else if (thing !== people[i]) {
    // 	People.update(thing, people[i]);
    // }
}

for (var i in projects) {
    thing = Projects.findOne(projects[i]._id);
    if (!thing) {
        Projects.insert(projects[i]);
    }
    // Create if entry doesn't exist. Otherwise, ignore.
    // else if (thing !== projects[i]) {
    // 	Projects.update(thing, projects[i]);
    // }
}

for (var i in sigs) {
    thing = Sigs.findOne(sigs[i]._id);
    if (!thing) {
        Sigs.insert(sigs[i]);
    }
    // Create if entry doesn't exist. Otherwise, ignore.
    // else if (thing !== sigs[i]) {
    // 	Sigs.update(thing, sigs[i]);
    // }
}

for (var i in apps) {
    thing = Apps.findOne(apps[i]);
    if (!thing) {
        Apps.insert(apps[i]);
    }
}

// for(var i in sprints) {
// 	thing = Sprints.findOne({ project: sprints[i].project });
// 	// console.log(thing);
// 	// console.log(sprints[i]);
// 	if (!thing) {
// 		Sprints.insert(sprints[i]);
// 	}
// 	else {
// 		// delete(thing._id); // sprints don't currently have custom things
// 	}
// 	// Create if entry doesn't exist. Otherwise, ignore.
// 	// else if (thing !== sprints[i]) {
// 	// 	Sprints.update(thing, sprints[i]);
// 	// }
// }

People.find().forEach(function(person) {
    thing = Meteor.users.findOne({username: person._id});
    if (!thing) {
        Accounts.createUser({username: person._id, password: 'password'});
        console.log('Created user ' + person._id);
    }
});
