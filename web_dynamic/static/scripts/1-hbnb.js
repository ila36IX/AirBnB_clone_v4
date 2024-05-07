$(document).ready(function () {
  const checklist = {};
  const amenityh4 = $('.amenities h4');

  $('.amenities input[type="checkbox"]').on('change', function (){
    if ($(this).is(':checked')) {
      checklist[this.dataset.id] = this.dataset.name;
    } else {
			delete checklist[this.dataset.id]
		};
    amenityh4.text(Object.values(checklist).join(', '));
  });
});
