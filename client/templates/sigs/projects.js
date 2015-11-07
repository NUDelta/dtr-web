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
  	return text.split(" ").splice(0,20).join(" ") + "...";
    }
});
