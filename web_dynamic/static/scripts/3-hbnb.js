const checklist = {};

$(() => {
  const amenityh4 = $('.amenities h4');

  $('.amenities input[type="checkbox"]:checked').each(function () {
    checklist[this.dataset.id] = this.dataset.name;
  });
  $('.no-places-container').addClass('hide');
  updatePlaces();
	showApiStatus();

  amenityh4.text(Object.values(checklist).join(', '));

  $('.amenities input').on('change', function () {
    if ($(this).is(':checked')) {
      checklist[this.dataset.id] = this.dataset.name;
    } else {
      delete checklist[this.dataset.id];
    }
    amenityh4.text(Object.values(checklist).join(', '));
    updatePlaces();
  });
});

function showApiStatus() {
	$.get('http://localhost:5001/api/v1/status/', function (data, textStatus, xhr) {
		if (textStatus === 'success') {
			$('#api_status').addClass('available');
		} else {
			$('#api_status').removeClass('available');
		}
	});
}

const placeComponent = (place) => {
  return `<article>
<div class="title_box"><h2>${place.name}</h2><div class="price_by_night">$${place.price_by_night}</div></div>
<div class="information">
<div class="max_guest">${place.max_guest} Guest${place.max_guest != 1 && 's' || ''}</div>
<div class="number_rooms">${place.number_rooms} Bedroom${place.number_rooms != 1 && 's' || ''}</div>
<div class="number_bathrooms">${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 && 's' || ''}</div>
</div>
<div class="description">${place.description}</div>
</article>`;
};

// Change the places that will be shown when user select/unselect a new amenity
function updatePlaces () {
  $.ajax({
    url: 'http://localhost:5001/api/v1/places_search',
    type: 'POST',
    data: JSON.stringify({ amenities: Object.keys(checklist) }),
    dataType: 'json',
    contentType: 'application/json',
    success: function (data) {
      const places = $('.places');
      places.html('');
      for (const place of data) {
        places.append(placeComponent(place));
      }
      const numPlaces = Object.keys(data).length;
      $('.num-places').text(numPlaces);
      if (numPlaces > 0) {
        $('.no-places-container').addClass('hide');
      } else {
        $('.no-places-container').removeClass('hide');
      }
    }
  });
}
