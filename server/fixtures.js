if (People.find().count() === 0) {
    if(!(typeof people === 'undefined')){
        for(var i in people){
            People.insert(people[i]);
        }
    }else{
	console.log("people are undefined");
    }
}

if (Projects.find().count() === 0) {
	if(!(typeof projects === 'undefined')){
		for(var i in projects){
			Projects.insert(projects[i]);
		}
	} else {
		console.log("projects are undefined");
	}
}

if (Sigs.find().count() === 0) {
	if(!(typeof sigs === 'undefined')){
		for(var i in sigs){
			Sigs.insert(sigs[i]);
		}
	} else {
		console.log("sigs are undefined");
	}
}

if (Sprints.find().count() === 0) {
	if(!(typeof sprints === 'undefined')){
		for(var i in sprints){
			Sprints.insert(sprints[i]);
		}
	} else {
		console.log("sprints are undefined");
	}
}

if (Stories.find().count() === 0) {
	if(!(typeof stories === 'undefined')){
		for(var i in stories){
			Stories.insert(stories[i]);
		}
	} else {
		console.log("stories are undefined");
	}
}

if (Tasks.find().count() === 0) {
	if(!(typeof tasks === 'undefined')){
		for(var i in tasks){
			Tasks.insert(tasks[i]);
		}
	} else {
		console.log("tasks are undefined");
	}
}