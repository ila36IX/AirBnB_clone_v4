#!/usr/bin/node

const checklist = {};
const amenityh4 = $('.amenities h4');

$('.amenities input[type="checkbox"]:checked').each(function (){
	checklist[this.dataset.id] = this.dataset.name;
});

amenityh4.text(Object.values(checklist).join(', '));

$('.amenities input[type="checkbox"]').on('change', function (){
	if ($(this).is(':checked')) {
		checklist[this.dataset.id] = this.dataset.name;
	} else {
		delete checklist[this.dataset.id]
	};
	amenityh4.text(Object.values(checklist).join(', '));
});

$.get('http://localhost:5001/api/v1/status/', function (data, textStatus, xhr) {
	if (textStatus === 'success') {
		$('#api_status').addClass('available');
	}else {
		$('#api_status').removeClass('available');
	}
}
);
