from diploma_app.db import db

class Shop(db.Model):
    __tablename__ = 'shops'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)

    products = db.relationship('Product', back_populates="shop", lazy="dynamic", cascade="all, delete")
    user = db.relationship("User", back_populates="shop", uselist=False)