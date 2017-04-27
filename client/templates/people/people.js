Template.People.helpers({
    people: function() {
        return People.find({
            description: {
                $not: ""
            }
        }).fetch().sort(function(x, y) {
            if (computeWorth(y) !== computeWorth(x)) {
                return computeWorth(y) - computeWorth(x);
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
        });
    }
});
