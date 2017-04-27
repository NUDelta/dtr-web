Template.Projects.helpers({
  sigs: function() {
    return Sigs.find({}, {
      sort: {
        title: 1
      }
    });
  },

  sig_project: function(sig_id) {
    return Projects.find({
      sig: sig_id
    }, {
      sort: {
        title: 1
      }
    });
  },

  people_list: function() {
    var team = People.find({
      _id: {
        $in: this.people
      }
    }).fetch();

    return team.sort(function(x, y) {
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

  proj_id: function() {
    return this._id.substring(5);
  },

  learn_more: function(text) {
    var n = 140;
    var isTooLong = text.length > n,
      s_ = isTooLong
        ? text.substr(0, n - 1)
        : text;

    s_ = isTooLong
      ? s_.substr(0, s_.lastIndexOf(' '))
      : s_;
    return isTooLong
      ? s_ + ' ...'
      : s_;
  }
});
