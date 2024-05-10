#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Places """
from models.state import State
from models.city import City
from models.place import Place
from models.user import User
from models.amenity import Amenity
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/cities/<city_id>/places', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/place/get_places.yml', methods=['GET'])
def get_places(city_id):
    """
    Retrieves the list of all Place objects of a City
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    places = [place.to_dict() for place in city.places]

    return jsonify(places)


@app_views.route('/places/<place_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/place/get_place.yml', methods=['GET'])
def get_place(place_id):
    """
    Retrieves a Place object
    """
    place = storage.get(Place, place_id)
    if not place:
        abort(404)

    return jsonify(place.to_dict())


@app_views.route('/places/<place_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/place/delete_place.yml', methods=['DELETE'])
def delete_place(place_id):
    """
    Deletes a Place Object
    """

    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    storage.delete(place)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/cities/<city_id>/places', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/place/post_place.yml', methods=['POST'])
def post_place(city_id):
    """
    Creates a Place
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'user_id' not in request.get_json():
        abort(400, description="Missing user_id")

    data = request.get_json()
    user = storage.get(User, data['user_id'])

    if not user:
        abort(404)

    if 'name' not in request.get_json():
        abort(400, description="Missing name")

    data["city_id"] = city_id
    instance = Place(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/places/<place_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/place/put_place.yml', methods=['PUT'])
def put_place(place_id):
    """
    Updates a Place
    """
    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")

    ignore = ['id', 'user_id', 'city_id', 'created_at', 'updated_at']

    for key, value in data.items():
        if key not in ignore:
            setattr(place, key, value)
    storage.save()
    return make_response(jsonify(place.to_dict()), 200)


# @app_views.route('/places_search', methods=['POST'], strict_slashes=False)
# @swag_from('documentation/place/post_search.yml', methods=['POST'])
# def places_search():
#     """
#     Retrieves all Place objects depending of the JSON in the body
#     of the request
#     """
#
#     if request.get_json() is None:
#         abort(400, description="Not a JSON")
#
#     data = request.get_json()
#
#     if data and len(data):
#         states = data.get('states', None)
#         cities = data.get('cities', None)
#         amenities = data.get('amenities', None)
#
#     if not data or not len(data) or (
#             not states and
#             not cities and
#             not amenities):
#         places = storage.all(Place).values()
#         list_places = []
#         for place in places:
#             list_places.append(place.to_dict())
#         return jsonify(list_places)
#
#     list_places = []
#     if states:
#         states_obj = [storage.get(State, s_id) for s_id in states]
#         for state in states_obj:
#             if state:
#                 for city in state.cities:
#                     if city:
#                         for place in city.places:
#                             list_places.append(place)
#
#     if cities:
#         city_obj = [storage.get(City, c_id) for c_id in cities]
#         for city in city_obj:
#             if city:
#                 for place in city.places:
#                     if place not in list_places:
#                         list_places.append(place)
#
#     if amenities:
#         if not list_places:
#             list_places = storage.all(Place).values()
#         amenities_obj = [storage.get(Amenity, a_id) for a_id in amenities]
#         list_places = [place for place in list_places
#                        if all([am in place.amenities
#                                for am in amenities_obj])]
#
#     places = []
#     for p in list_places:
#         d = p.to_dict()
#         d.pop('amenities', None)
#         places.append(d)
#
#     return jsonify(places)
def cites_stateid(states_id):
    """Get list of all cities of State ids"""
    cities = []
    for state_id in states_id:
        state = storage.get(State, state_id)
        if state:
            cities.extend(state.cities)
    return cities


def cities_cityid(cities_ids):
    """Get list of all cities of City ids"""
    cities = []
    for city_id in cities_ids:
        city = storage.get(City, city_id)
        if city:
            cities.append(city)
    return cities


def places_cities(cities):
    """Get list of all places in cities"""
    places = []
    for city in cities:
        places.extend(city.places)
    return places


def places_dict(places):
    """Convert places objects list into a list of a serializable dicts"""
    dicts = []
    for place in places:
        p = place.to_dict()
        p.pop("amenities", None)
        dicts.append(p)
    return dicts


@app_views.route(
    "/places_search",
    methods=["POST"],
    strict_slashes=False
)
def place_search():
    """Search for places using list of cities and places and amenities. Place
    id is in the response means:
        - The place is in one of City ids listed
        - The place is in one of cities state ids listed
        - The place is having all Amenity ids listed (if not empty)
    If states and cities is empty, all Place ids having all Amenity ids will be
    listed.
    """
    filters = request.get_json(force=True, silent=True)
    if filters is None:
        return jsonify({"error": "Not a JSON"}), 400
    city_ids = filters.get("cities")
    state_ids = filters.get("states")
    amenity_ids = filters.get("amenities")
    places = []
    cities = []

    if not (city_ids or state_ids or amenity_ids):
        all_places = storage.all(Place).values()
        return jsonify([pl.to_dict() for pl in all_places])
    if amenity_ids and not (state_ids or city_ids):
        places = list(storage.all(Place).values())
    if city_ids:
        # All ciities giving by the user
        cities.extend(cities_cityid(city_ids))
    if state_ids:
        # All ciities in states giving by the user
        cities.extend(cites_stateid(state_ids))
    if cities:
        # Note that cities is holding all the possible cities object given by
        # the user and also all the cities in the states, that could lead to
        # having some city appears more than one, that's why we had to use set
        places = places_cities(set(cities))

    if amenity_ids:
        # Filter by only the places that have the amenities giving by the user
        places = list(filter(
            lambda p: set(amenity_ids).issubset([a.id for a in p.amenities]),
            places
        ))
    return jsonify(places_dict(places))
