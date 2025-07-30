from flask.views import MethodView
from flask_jwt_extended import (get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from diploma_app.db import db
from diploma_app.models.shop import Shop
from diploma_app.schemas.shop import ShopSchema

blp = Blueprint("Store", "stores", description="Operations on stores")
@blp.route("/store")
class StoreCRUD(MethodView):
    @blp.arguments(ShopSchema)
    @jwt_required()
    def post(self, user_data):
        user_id = get_jwt_identity()
        if Shop.query.filter(Shop.user_id == user_id).first():
            abort(409, message="Shop for current user already exists")

        shop = Shop(
            name=user_data["name"],
            description=user_data["description"],
        )

        db.session.add(shop)
        db.session.commit()

        return {"message": "Shop created successfully."}, 201

    @blp.response(ShopSchema)
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        shop = Shop.query.filter(Shop.user_id == user_id).first()
        if not shop:
            abort(404, message="Shop for current user not found")
        return {"shop": shop}

    @blp.arguments(ShopSchema)
    @jwt_required()
    def put(self, user_data):
        user_id = get_jwt_identity()
        shop = Shop.query.filter(Shop.user_id == user_id).first()
        if not shop:
            abort(404, message="Shop for current user not found")
        if "name" in user_data:
            shop.name = user_data["name"]
        if "description" in user_data:
            shop.description = user_data["description"]
        db.session.commit()

        return {"message": "Shop updated successfully."}, 200

    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()
        shop = Shop.query.filter(Shop.user_id == user_id).first()
        if not shop:
            return {"message": "No content"} , 202
        db.session.delete(shop)

        return {"message": "Shop deleted successfully."}, 200
