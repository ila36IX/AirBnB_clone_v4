const placeComponent = (place) => {
	return $(`<article>
<div class="title_box"><h2>${place.name}</h2><div class="price_by_night">$${place.price_by_night}</div></div>
<div class="information">
<div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 && 's' || ''}</div>
<div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 && 's' || ''}</div>
<div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 && 's' || ''}</div>
</div>
<div class="description">${place.description}</div>
</article>`);
}


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

$.ajax({
	url: 'http://0.0.0.0:5001/api/v1/places_search',
	type: "POST",
	data: JSON.stringify({}),
	dataType: "json",
	contentType: "application/json",
	success: function (data) {
		const places = $('.places');
		places.html('')
		for (const place of data) {
			places.append(placeComponent(place));
		}
	}
});
