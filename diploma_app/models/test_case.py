from datetime import datetime, timezone
from diploma_app.db import db


class TestCase(db.Model):
    __tablename__ = 'test_cases'
    id = db.Column(db.Integer, primary_key=True)
    given_id = db.Column(db.Integer, nullable=False)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Integer, nullable=False)
    is_system = db.Column(db.Boolean, default=False)

    preconditions = db.Column(db.Text)
    postconditions = db.Column(db.Text)

    version = db.Column(db.String(30), nullable=False)
    environment = db.Column(db.String(100), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    user = db.relationship('User', backref=db.backref('test_cases', lazy='dynamic'))

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(tz=timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(tz=timezone.utc),
                           onupdate=lambda: datetime.now(tz=timezone.utc))

    comments = db.Column(db.String(255))

    steps = db.relationship('TestStep', back_populates='test_case', cascade="all, delete-orphan", lazy="joined")

    __table_args__ = (db.UniqueConstraint('user_id', 'given_id', name='uix_user_tc_given_id'),)