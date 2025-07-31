from diploma_app.db import db
from datetime import datetime, timezone


class BugReport(db.Model):
    __tablename__ = 'bug_reports'
    id = db.Column(db.Integer, primary_key=True)
    given_id = db.Column(db.Integer, nullable=False)

    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)

    preconditions = db.Column(db.String(255), nullable=False)
    postconditions = db.Column(db.String(255), nullable=False)

    actual_result = db.Column(db.Text, nullable=False)
    expected_result = db.Column(db.Text, nullable=False)

    severity = db.Column(db.String(50), nullable=False, default='medium')  # e.g., low/medium/high/blocker
    priority = db.Column(db.String(50), nullable=False, default='medium')
    status = db.Column(db.String(50), nullable=False, default='open')  # e.g., open, in_progress, closed

    version = db.Column(db.String(30), nullable=False, default='latest')
    environment = db.Column(db.String(100), nullable=False, default='development')

    steps_to_reproduce = db.relationship('BugStep', back_populates='bug_report', cascade="all, delete-orphan",lazy="joined")

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    user = db.relationship('User', backref=db.backref('bug_reports', lazy='dynamic'))

    is_system = db.Column(db.Boolean, default=False)
    comments = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(tz=timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(tz=timezone.utc),
                           onupdate=lambda: datetime.now(tz=timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'given_id', name='uix_user_bug_given_id'),)
