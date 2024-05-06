#!/usr/bin/node


$(() => {
  const checklist = {};
  const = amenityh4 = $(".amenities h4");
  
  $('.amenities input[type="checkbox"]').on('checked', function (){
    if (this.checked){
      checklist[this.dataset.id] = this.dataset.name;
    }else delete checklist[this.dataset.if];
    amenityh4.text(Object.values(checklist).join(', ');
  });
});
$.get('http://0.0.0.0:5001/api/v1/status/', function (data, textStatus, xhr) {
  if (textStatus === 'OK') {
    $('#api_status').addClass('available');
  }else {
    $('#api_status').removeClass('available');
  }
}
);
