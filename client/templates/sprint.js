$(document).ready(function() {

  $(window).keydown(function(event){
    if(event.keyCode == 13) {
    	console.log(event.target);
    	console.log(event.currentTarget);
      var formData = $('form').data();
      console.log(formData);
      var formText = $(event.target).val(),
      D = $('#checkbox-D').val() === 'on',
      T = $('#checkbox-T').val() === 'on',
      R = $('#checkbox-R').val() === 'on';
      console.log(D);
      console.log(T);
      console.log(R);
      if ($(event.target).attr('id') === 'story') {
	      $('<p>' + formText + '</p>').insertBefore('form');
	      $('#story').hide();
	      $('#task').show();
	      $('#task').focus();
  	  }
  	  else {
  	  	$('<p style="display: inline-block; margin-right: 10px;" class="task">' + formText + '</p>').insertBefore('form');
        if (D) {
          $('<span class="badge" style="margin-right: 5px;">D</span>').insertBefore('form');
        }
        if (T) {
          $('<span class="badge" style="margin-right: 5px;">T</span>').insertBefore('form');
        }
        if (R) {
          $('<span class="badge" style="margin-right: 5px;">R</span>').insertBefore('form');
        }
	      $('#story').hide();
	      $('#task').show();
	      $('#task').focus();
	      $('#task').val('');
	      $('#btn-story-done').show();
  	  }
      event.preventDefault();
      return false;
    }
  });
});

Template.sprint.addHighcharts = function () {
  Meteor.defer(function () {
    $(function () {
    $('#donut-container').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        title: {
            text: 'This<br>sprint',
            align: 'center',
            verticalAlign: 'middle',
            y: 50
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    distance: -50,
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textShadow: '0px 1px 2px black'
                    }
                },
                center: ['50%', '75%']
            }
        },
        series: [{
            type: 'pie',
            name: 'This sprint',
            innerSize: '50%',
            data: [
                ['Design',   45.0],
                ['Technology',       20.0],
                ['Research', 35.0]
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



