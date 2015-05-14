Template.sprint.addHighcharts = function () {
  Meteor.defer(function () {
    $(function () {
    $('#container').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        colors: ['#5cb85c', '#5bc0de', '#f0ad4e', '#fff'],
        title: {
            text: '32',
            align: 'center',
            verticalAlign: 'middle',
            y: 80
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: 40,
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0px 1px 2px black'
                    }
                },
                startAngle: -180,
                endAngle: 180,
                center: ['50%', '75%']
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            innerSize: '50%',
            data: [
                ['D',   45.0],
                ['T',       26.8],
                ['R', 12.8]
            ]
        }]
    });
});

  });
  // return nothing
};

Template.sprint.helpers({
  sprints: function() {
    return Sprints.find();
  }
});



