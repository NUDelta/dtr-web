Template.Projects.helpers({
    sigs: function() {
	return Sigs.find().sort({title: 1});
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
	var n = 140;
	var isTooLong = text.length > n,
                   s_ = isTooLong ? text.substr(0,n-1) : text;

         s_ = isTooLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
         return  isTooLong ? s_ + ' ...' : s_;
    }	
});
