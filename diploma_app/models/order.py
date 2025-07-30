from sqlalchemy import Numeric

from diploma_app.db import db
from datetime import datetime, timezone


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(tz=timezone.utc))
    #status = db.Column(db.String(50), default='created')  # created, paid, shipped, etc.

    total_amount = db.Column(Numeric(10, 2), nullable=False)

    user = db.relationship('User', backref=db.backref('orders', lazy='dynamic'))
    items = db.relationship('OrderItem', back_populates="order", lazy="joined", cascade="all, delete-orphan")
