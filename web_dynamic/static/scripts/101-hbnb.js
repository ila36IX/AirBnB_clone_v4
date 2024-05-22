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
	$('body').on('click', ".show-reviews",function() {
		$(".reviews ul").text("");
		if ($(this).text() === "Show"){
			showReviews(this.dataset.id);	
		$(".reviews button").text("Show");
			$(`#${this.dataset.id} button`).text("Hide");
		}
		else
			$(`#${this.dataset.id} button`).text("Show");
	})
});

function showApiStatus() {
	$.get('http://localhost:5001/api/v1/status/', function (data, status) {
		if (status === 'success') {
			$('#api_status').addClass('available');
		}
	})
}

const placeComponent = (place) => {
  return `
<article id="${place.id}">
	<div class="title_box">
		<h2>${place.name}</h2>
		<div class="price_by_night">$${place.price_by_night}</div>
	</div>
	<div class="information">
		<div class="max_guest">
			${place.max_guest} Guest${place.max_guest != 1 && 's' || ''}
		</div>
		<div class="number_rooms">
			${place.number_rooms} Bedroom${place.number_rooms != 1 && 's' || ''}
		</div>
		<div class="number_bathrooms">
			${place.number_bathrooms} Bathroom${place.number_bathrooms != 1 && 's' || ''}
		</div>
	</div>
	<div class="description">${place.description}</div>
	<div class="reviews">
		<h2>
			Reviews
			<button class="show-reviews" data-id=${place.id}>Show</button>
		</h2>
		<ul>
		</ul>
	</div>
</article>`;
};

function review(reviewObj){
	let user_name = '<img width="15px" src="../static/images/comments_loading.gif"/>';

	$.ajax({
		url: `http://localhost:5001/api/v1/users/${reviewObj.user_id}`,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		success: data => {
			user_name = data.first_name + " " + data.last_name;
			$(`#${reviewObj.user_id}`).text(user_name);
		}
	});
	const date = new Date(Date.parse(reviewObj.updated_at));
	const formattedDate = new Date(date).toLocaleDateString('en-US', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
	return `
		<li class="review">
				<h3>
					From <span id="${reviewObj.user_id}">${user_name}</span>
				</h3>
				<span>At ${formattedDate}</span>
				<p>${reviewObj.text}</p>
		<li>
	`
}

// Fetch the reviews of a place, and add them to the DOM
function showReviews(place_id) {
	function onSuccess(data) {
		const selector = `#${place_id} ul`;
		if (data.length > 0)
			data.forEach((r)=> $(selector).append(review(r)));
		else
			$(selector).append("<span>No review found</span>");
	}

	$.ajax({
		url: `http://localhost:5001/api/v1/places/${place_id}/reviews`,
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json',
		success: (data) => onSuccess(data)
	});
}

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
