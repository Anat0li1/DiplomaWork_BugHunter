from datetime import datetime, timezone

from diploma_app.db import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    active_role = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    shop = db.relationship("Shop", back_populates="user", uselist=False)


