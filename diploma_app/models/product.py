from sqlalchemy import Numeric

from diploma_app.db import db


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    price = db.Column(Numeric(10, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'))
    image_url = db.Column(db.String(512), nullable=True) 
    category = db.Column(db.String(100), nullable=True, index=True) 

    shop = db.relationship('Shop', back_populates='products')

    __table_args__ = (db.UniqueConstraint('shop_id', 'name', name='uix_shop_product_name'),)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price), 
            'quantity': self.quantity,
            'image_url': self.image_url, 
            'category': self.category  
        }