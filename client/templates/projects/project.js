Template.Project.helpers({
    people_list : function(){
	   return People.find({ _id : { $in : this.people   }});
    },
    // this is repeated code...do something about this in the future
    get_array: function (array) {
        return _.map(array, function(data, index) {
            data.index = index;
            return data;
        });
    },
    determine_clear: function (index) {
        if (index > 0 && index % 2 === 0) {
            return 'clear: both';
        }
        else {
            return '';
        }
    }
});
