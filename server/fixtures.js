if (People.find().count() === 0) {
    if(!(typeof people === 'undefined')){
        for(var i in people){
            People.insert(people[i]);
        }
    }else{
	console.log("people are undefined");
    }
}
