Template.Project.helpers({
    video_with_src: function() {
        return this.video.indexOf("youtube") == -1
    },
    people_list: function() {
        var members = People.find({
            _id: {
                $in: this.people
            }
        }).fetch();
        return members.sort(function(x, y) {
            if (computeWorth(y) !== computeWorth(x)) {
                return computeWorth(x) - computeWorth(y);
            } else {
                var A = x.name.toLowerCase();
                var B = y.name.toLowerCase();
                if (A < B) {
                    return -1;
                } else if (A > B) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }).filter(function(x) {
            return computeWorth(x) > 0
        })
    },
    // this is repeated code...do something about this in the future
    get_array: function(array) {
        return _.map(array, function(data, index) {
            data.index = index;
            return data;
        });
    },
    determine_clear: function(index) {
        if (index > 0 && index % 2 === 0) {
            return 'clear: both';
        } else {
            return '';
        }
    }
});
