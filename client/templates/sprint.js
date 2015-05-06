$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
    	console.log(event.target);
    	console.log(event.currentTarget);
      var formText = $(event.target).val();
      if ($(event.target).attr('id') === 'story') {
	      $('<p>' + formText + '</p>').insertBefore('form');
	      $('#story').hide();
	      $('#task').show();
	      $('#task').focus();
  	  }
  	  else {
  	  	$('<p class="task">' + formText + '</p>').insertBefore('form');
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