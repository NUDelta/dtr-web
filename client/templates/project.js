Template.Project.helpers({
    people_list : function(){
	return People.find({ _id : { $in : this.people   }});
   }});
