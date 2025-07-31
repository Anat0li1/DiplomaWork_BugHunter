from flask.views import MethodView
from flask_jwt_extended import (get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from sqlalchemy import and_

from diploma_app.db import db
from diploma_app.models.cart_item import CartItem
from diploma_app.models.shop import Shop
from diploma_app.models.user import User
from diploma_app.models.product import Product
from diploma_app.schemas.cart_item import CartItemSchema

blp = Blueprint("CartItem", "cart items", description="Operations related to cart items")

@blp.route("/cart")
class CartCRD(MethodView):
    @blp.response(200, CartItemSchema(many=True))
    @jwt_required
    def get(self):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role == "admin":
            abort(404, message="Cart for admin not found")
        if not Shop.query.filter(Shop.user_id == user.id).first():
            abort(404, message="Shop not found, cart not exist")
        cart_items = CartItem.query.filter(CartItem.user_id==user.id).all()
        if not cart_items:
            return {"message": "Your cart is empty"}, 200
        return {"cart": cart_items}, 200  #TODO:count the biggest number of items later

    @blp.arguments(CartItemSchema)
    @jwt_required
    def post(self, user_data):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role == "admin":
            abort(404, message="Cart for admin not found")
        if not Shop.query.filter(Shop.user_id == user.id).first():
            abort(404, message="Shop not found, cart not exist")
        cart_item = CartItem(
            user_id=user.id,
            product_id = user_data["product_id"],
            quantity = user_data["quantity"],
        )

        db.session.add(cart_item)
        db.session.commit()

        return {"message": "Added new element", "cart_item": cart_item.serialize()}, 201

    @jwt_required()
    def delete(self):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role == "admin":
            abort(200, message="Cart for admin never exists")
        if not Shop.query.filter(Shop.user_id == user.id).first():
            abort(200, message="As shop not found, cart not exist")
        cart_items = CartItem.query.filter(CartItem.user_id==user.id).all()
        if not cart_items:
            return {"message": "Your cart is empty, nothing to delete"}, 200
        db.session.delete(cart_items)
        db.session.commit()
        return {"message": "Cart was cleared"}, 200

@blp.route("/cart/{int:cart_item_id}")
class CartItem(MethodView):
    @blp.arguments(CartItemSchema)
    @jwt_required
    def put(self, cart_item_id, user_data):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role == "admin":
            abort(404, message="Cart for admin not found")
        if not Shop.query.filter(Shop.user_id == user.id).first():
            abort(404, message="Shop not found, cart not exist")
        target_item = CartItem.query.get(cart_item_id)
        if not target_item:
            abort(404, message="Cart item not found")
        if "quantity" in user_data:
            target_item.quantity = user_data["quantity"]
        db.session.commit()

        return {"message": "Cart item updated successfully"}, 200

    @jwt_required()
    def delete(self, cart_item_id):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role == "admin":
            abort(200, message="Cart for admin never exists")
        if not Shop.query.filter(Shop.user_id == user.id).first():
            abort(200, message="As shop not found, cart not exist, item not found")
        target_item = CartItem.query.get(cart_item_id)
        db.session.delete(target_item)
        db.session.commit()
        return {"message": "Cart item deleted successfully"}, 200
