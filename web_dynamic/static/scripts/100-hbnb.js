const checklist = {};
const checkedStates = {};
const checkedCities = {};

$(() => {
  const amenityh4 = $('.amenities h4');
	const checkedStatesIndecator = $(".locations h4")

  $('.amenities input:checked').each(function () {
    checklist[this.dataset.id] = this.dataset.name;
  });
  $('.locations input[name="city"]:checked').each(function () {
    checkedCities[this.dataset.id] = this.dataset.name;
  });
  $('.locations input[name="state"]:checked').each(function () {
    checkedStates[this.dataset.id] = this.dataset.name;
  });
  $('.no-places-container').addClass('hide');

  updatePlaces();
	showApiStatus();

  amenityh4
		.text(Object.values(checklist)
		.join(', '));
  checkedStatesIndecator
		.text(Object.values({...checkedStates, ...checkedCities})
		.join(', '));

  $('.amenities input').on('change', function () {
    if ($(this).is(':checked')) {
      checklist[this.dataset.id] = this.dataset.name;
    } else {
      delete checklist[this.dataset.id];
    }
    amenityh4.text(Object.values(checklist).join(', '));
    updatePlaces();
  });

	$('.locations input[name="state"]').on('change', function() {
    if ($(this).is(':checked')) {
      checkedStates[this.dataset.id] = this.dataset.name;
    } else {
      delete checkedStates[this.dataset.id];
    }
    checkedStatesIndecator.text(Object.values({...checkedStates, ...checkedCities}).join(', '));
    updatePlaces();
	});
	$('.locations input[name="city"]').on('change', function() {
    if ($(this).is(':checked')) {
      checkedCities[this.dataset.id] = this.dataset.name;
    } else {
      delete checkedCities[this.dataset.id];
    }
    checkedStatesIndecator.text(Object.values({...checkedStates, ...checkedCities}).join(', '));
    updatePlaces();
	});
});

function showApiStatus() {
	$.get('http://localhost:5001/api/v1/status/', function (data, status) {
		if (status === 'success') {
			$('#api_status').addClass('available');
		}
	})
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
	function onSuccess(data) {
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
	const filters = {
		amenities: Object.keys(checklist),
		cities: Object.keys(checkedCities),
		states: Object.keys(checkedStates)
	}
	$.ajax({
		url: 'http://localhost:5001/api/v1/places_search',
		type: 'POST',
		data: JSON.stringify(filters),
		dataType: 'json',
		contentType: 'application/json',
		success: (data) => onSuccess(data)
	});
}
