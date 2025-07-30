from flask.views import MethodView
from flask_jwt_extended import (get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from sqlalchemy import and_

from diploma_app.db import db
from diploma_app.models.shop import Shop
from diploma_app.models.user import User
from diploma_app.models.order import Order
from diploma_app.models.order_item import OrderItem
from diploma_app.models.product import Product
from diploma_app.resources.cart_item import CartItem
from diploma_app.schemas.product import ProductSchema

blp = Blueprint("Order", "orders", description="Operations on store orders")

@blp.route("/orders")
class OrdersCR(MethodView):
    @jwt_required
    def post(self):
        user = User.query.get_or_404(get_jwt_identity())
        if user.active_role == "admin":
            abort(400, message="Admins cannot place orders.")
        if not user.shop:
            abort(400, message="Cannot place order without shop.")
        cart_items = CartItem.query.filter_by(user_id=user.id).all()
        if not cart_items:
            abort(400, message="Cart is empty. Nothing to order.")
        total = 0
        new_order = Order(
            user_id=user.id,
            total_amount=total,
        )
        db.session.add(new_order)
        db.session.commit()
        order_id = new_order.id

        for cart_item in cart_items:
            db_item = Product.query.filter(Product.product_id==cart_item.product_id).first()
            if cart_item.quantity > db_item.quantity:
                db.session.delete(new_order)
                db.session.commit()
                abort(400, message=f"Not enough {db_item.name} available. Only {db_item.quantity} available.")
            new_order_item = OrderItem(
                order_id=order_id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                product_name=db_item.name,
                unit_price=db_item.price,
            )
            total += new_order_item.quantity * new_order_item.unit_price

            db.session.add(new_order_item)
            db.session.commit()

        new_order.total_amount = total
        db.session.commit()

        return {"message": "Order placed."}, 201

    @jwt_required
    def get(self):
        user = User.query.get_or_404(get_jwt_identity())
        if user.active_role == "admin":
            abort(400, message="Admins cannot have orders.")
        if not user.shop:
            abort(400, message="Orders cannot exist without shop.")
        orders = Order.query.filter_by(user_id=user.id).all()
        if not orders:
            abort(200, message="Your list of orders is empty.")
        return {"orders": [order.serialize() for order in orders]}, 200

@blp.route("/orders/<int:order_id>")
class OrderItem(MethodView):
    @jwt_required
    def get(self, order_id):
        user = User.query.get_or_404(get_jwt_identity())
        order = Order.query.get_or_404(order_id)
        if user.active_role == "admin":
            abort(400, message="Admins cannot have orders.")
        if user.id != order.user_id:
            abort(403, message="You can't view orders other than yourself.")
        return {"order": order.full_serialize()}, 200