from flask.views import MethodView
from flask_jwt_extended import (get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from sqlalchemy import and_

from diploma_app.db import db
from diploma_app.models.shop import Shop
from diploma_app.models.user import User
from diploma_app.models.product import Product
from diploma_app.schemas.product import ProductSchema

blp = Blueprint("Product", "products", description="Operations on products in the store")
@blp.route("/store/products")
class ProductsCRD(MethodView):
    @blp.arguments(ProductSchema)
    @jwt_required()
    def post(self, user_data):
        user_id = get_jwt_identity()
        shop_id = Shop.query.filter(user_id=user_id).first().shop_id
        if not shop_id:
            abort(404, message="Store not found")
        if Product.query.filter(and_(
            Product.shop_id == shop_id,
            Product.name == user_data["name"],
        )).first():
            abort(409, message="Product already exists in the current shop")
        product = Product(
            name = user_data["name"],
            description = user_data["description"],
            price = user_data["price"],
            quantity = user_data["quantity"],
            shop_id = shop_id,
        )
        db.session.add(product)
        db.session.commit()
        return {"message": "Product created", "product": product.serialize()}, 201

    @blp.response(200, ProductSchema(many=True))
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        shop_id = Shop.query.filter(user_id=user_id).first().shop_id
        if not shop_id:
            abort(404, message="Store not found")
        products = Product.query.filter(Product.shop_id == shop_id).all()
        if not products:
            return {"message":"Current shop is empty"}, 200
        return products

    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()
        shop_id = Shop.query.filter(user_id=user_id).first().shop_id #TODO: add admin role check
        if not shop_id:
            abort(404, message="Store not found")
        deleted_count = db.session.delete(Product.query.filter(Product.shop_id == shop_id).all())
        db.session.commit()
        return {"message": "Product deleted", "deleted_count": deleted_count}, 200

@blp.route("/shop/products/{product_id}")
class SeparateProductRUD(MethodView):
    @blp.response(200, ProductSchema)
    @jwt_required()
    def get(self, product_id):
        user_id = get_jwt_identity()
        shop_id = Shop.query.filter(Shop.user_id==user_id).first().shop_id
        if not shop_id:
            abort(404, message="Store not found")
        target_product = Product.query.filter(Product.id == product_id).first()
        if not target_product:
            abort(404, message="Product not found")
        if target_product.shop_id != shop_id:
            abort(403, message="Access denied, product is not in your shop")
        return target_product

    @blp.arguments(ProductSchema)
    @jwt_required()
    def put(self, product_id, user_data):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = Shop.query.filter(Shop.user_id == user.user_id).first().shop_id
        if not shop_id:
            abort(404, message="Store not found")
        target_product = Product.query.filter(Product.id == product_id).first()
        if not target_product:
            abort(404, message="Product not found")
        if target_product.shop_id != shop_id:
            abort(403, message="Access denied, product is not in your shop")
        if "name" in user_data:
            target_product.name = user_data["name"]
        if "description" in user_data:
            target_product.description = user_data["description"]
        if "price" in user_data:
            target_product.price = user_data["price"]
        if "quantity" in user_data:
            target_product.quantity = user_data["quantity"]
        db.session.commit()
        return {"message": "Product updated", "product": target_product.serialize()}, 200

    @jwt_required()
    def delete(self, product_id):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = Shop.query.filter(Shop.user_id == user.user_id).first().shop_id
        if not shop_id:
            abort(404, message="Store not found")
        target_product = Product.query.filter(Product.id == product_id).first()
        if not target_product:
            abort(200, message="There is no product with that id")
        if target_product.shop_id != shop_id:
            abort(403, message="Access denied, product is not in your shop")

        db.session.delete(target_product)
        db.session.commit()

        return {"message": "Product deleted"}, 200
