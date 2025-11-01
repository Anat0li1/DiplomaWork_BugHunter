from flask import request
from flask.views import MethodView
from flask_jwt_extended import (get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from sqlalchemy import and_, or_

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
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = user.shop.id
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
            image_url = user_data.get("image_url"), 
            category = user_data.get("category")   
        )
        db.session.add(product)
        db.session.commit()
        return {"message": "Product created", "product": product.serialize()}, 201
    
    @blp.response(200, ProductSchema(many=True))
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        shop = Shop.query.filter_by(user_id=user_id).first()
        if not shop:
            abort(404, message="Store not found for current user")
        
        query = Product.query.filter_by(shop_id=shop.id)

        search_term = request.args.get('search')
        if search_term:
            query = query.filter(or_(
                Product.name.ilike(f"%{search_term}%"),
                Product.description.ilike(f"%{search_term}%")
            ))

        category = request.args.get('category')
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))

        sort_by = request.args.get('sort_by')
        if sort_by == 'price_asc':
            query = query.order_by(Product.price.asc())
        elif sort_by == 'price_desc':
            query = query.order_by(Product.price.desc())
        else:
            query = query.order_by(Product.name.asc())
        
        products = query.all()
        return products

    @jwt_required()
    def delete(self):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = user.shop.id
        if not shop_id:
            abort(404, message="Store not found")
        products = user.shop.products.all()
        for product in products:
            db.session.delete(product)

        db.session.commit()
        return {"message": "All products in the shop deleted", "deleted_count": len(products)}, 200

@blp.route("/shop/products/<int:product_id>")
class SeparateProductRUD(MethodView):
    @blp.response(200, ProductSchema)
    @jwt_required()
    def get(self, product_id):
        user_id = get_jwt_identity()
        shop_id = Shop.query.filter(Shop.user_id==user_id).first().id
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
    def put(self, user_data, product_id):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = Shop.query.filter(Shop.user_id == user.id).first().id
        if not shop_id:
            abort(404, message="Store not found")
        target_product = Product.query.filter(Product.id == product_id).first()
        if not target_product:
            abort(404, message="Product not found")
        if target_product.shop_id != shop_id:
            abort(403, message="Access denied, product is not in your shop")
        target_product.name = user_data.get("name", target_product.name)
        target_product.description = user_data.get("description", target_product.description)
        target_product.price = user_data.get("price", target_product.price)
        target_product.quantity = user_data.get("quantity", target_product.quantity)
        target_product.image_url = user_data.get("image_url", target_product.image_url)
        target_product.category = user_data.get("category", target_product.category)
        db.session.commit()
        return {"message": "Product updated", "product": target_product.serialize()}, 200

    @jwt_required()
    def delete(self, product_id):
        user = User.query.filter(User.id == get_jwt_identity()).first()
        if user.active_role != "admin":
            abort(403, message="Permission denied, you must be admin to do this action")
        shop_id = Shop.query.filter(Shop.user_id == user.id).first().id
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

@blp.route("/products")
class ProductList(MethodView):
    @blp.response(200, ProductSchema(many=True))
    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)
        search = request.args.get("q", "", type=str)
        category = request.args.get("category", None, type=str)

        query = Product.query

        if search:
            query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))
        if category:
            query = query.filter(Product.category == category)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "products": [p.serialize() for p in pagination.items],
            "total": pagination.total,
            "page": page,
            "pages": pagination.pages,
        }
