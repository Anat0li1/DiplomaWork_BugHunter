from diploma_app.db import db


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)

    product_name = db.Column(db.String(255), nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    order = db.relationship('Order', back_populates="items")
    product = db.relationship('Product')

    def serialize(self):
        return {
            'product_name': self.product_name,
            'unit_price': float(self.unit_price),
            'quantity': self.quantity
        }