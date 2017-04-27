Template.projectEdit.rendered = function() {
    // project_id = this.data._id;

    var people = [];
    People.find().forEach(function(person) {
        people.push(person.name);
    });
    $('.add-teammate-input').autocomplete({source: people});
};

Template.projectEdit.helpers({
    find_person: function(username) {
        return People.findOne(username).name;
    },
    teammate_is_current_user: function(user_id) {
        return user_id === Meteor.user().username;
    },
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

Template.projectEdit.events({
    'change .project-edit input.normal-edit, change .project-edit textarea.normal-edit': function(e) {
        e.stopPropagation();

        var attribute = e.currentTarget.name;
        var value = e.currentTarget.value;
        var update = {}
        update[attribute] = value;

        Projects.update(this._id, {$set: update});
    },
    'change .images-edit input, change .images-edit textarea': function(e) {
        // repeats some code with change publications, but w/e
        e.stopPropagation();
        var project_id = Template.instance().data._id;
        var index = e.currentTarget.getAttribute('data-index');
        var purpose = $(e.currentTarget).data('purpose');
        var value = e.currentTarget.value;

        var images = Projects.findOne(project_id).images;
        images[index][purpose] = value;

        Projects.update(project_id, {
            $set: {
                images: images
            }
        });

    },
    'click .images-edit .glyphicon-remove': function(e) {
        e.stopPropagation();
        var project_id = Template.instance().data._id;
        var index = e.currentTarget.getAttribute('data-index');
        var images = Projects.findOne(project_id).images;
        images.splice(index, 1);
        Projects.update(project_id, {
            $set: {
                images: images
            }
        });
    },
    'click #images-add': function(e) {
        if (!Projects.findOne(this._id).images) {
            Projects.update(this._id, {
                $set: {
                    images: [{}]
                }
            });
        } else {
            Projects.update(this._id, {
                $push: {
                    images: {}
                }
            });
        }
    },
    'click .publication-add': function() {
        Projects.update(this._id, {
            $push: {
                publications: {
                    title: undefined,
                    conference: undefined,
                    url: undefined
                }
            }
        });
    },
    'click .publications-edit .glyphicon-remove': function(e) {
        var title = $(e.currentTarget).data('title');
        var conference = $(e.currentTarget).data('conference');
        var url = $(e.currentTarget).data('url');
        var project_id = Template.instance().data._id;

        // awful hacky, but can't think of a good way to do this...
        // found a way to index stuff...update to match images-ediit soon
        var match = {
            title: title,
            conference: conference,
            url: url
        };
        if (!title) {
            delete match.title;
        }
        if (!conference) {
            delete match.conference;
        }
        if (!url) {
            delete match.url;
        }
        var publications = Projects.findOne(project_id).publications;
        publications.splice(publications.indexOf(match), 1);
        Projects.update(project_id, {
            $set: {
                publications: publications
            }
        });
    },
    'change .publications-edit input': function(e) {
        e.stopPropagation();
        var purpose = $(e.currentTarget).data('purpose');
        var value = e.currentTarget.value;
        var identifier = $(e.currentTarget).data('identifier');
        var project_id = Template.instance().data._id;

        var publications = Projects.findOne(project_id).publications;
        for (var i in publications) {
            if (publications[i].title === identifier) {
                publications[i][purpose] = value;
            }
        }
        Projects.update(project_id, {
            $set: {
                publications: publications
            }
        });
    },
    'click .project-team-edit .glyphicon-remove': function(e) {
        var user_id = $(e.currentTarget).data('uid');
        var project_id = Template.instance().data._id;
        Projects.update(project_id, {
            $pull: {
                people: user_id
            }
        });
    },
    'submit #add-teammate-form': function(e) {
        e.preventDefault();
        var person = People.findOne({name: e.target.teammate.value});
        if (person) {
            Projects.update(this._id, {
                $push: {
                    people: person._id
                }
            });
            e.target.reset();
        } else {
            alert('User not found.');
        }
    }
});
