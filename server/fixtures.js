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