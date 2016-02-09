Template.Projects.helpers({
    sigs: function() {
	return Sigs.find();
    },
    
    sig_project: function(sig_id) {
  	return Projects.find({sig: sig_id});
    },
    

    people_list : function(){
	return People.find({ _id : { $in : this.people}});
    },
    
    proj_id : function(){
	return this._id.substring(5);
    },
    
    learn_more: function(text) {
	if (text.length < 140) return text
	
	tl = text.split(" ").splice(0,20);
	text_out = tl[0];
	for (var i = 1; i < tl.length; i++) {
	    if(text_out.length + tl[i].length + 1 < 140) { 
		text_out += " ";
		text_out += tl[i]
	    }else {
		return text_out + "...";
	    }
	}
  	return text_out + "...";
    }
});
