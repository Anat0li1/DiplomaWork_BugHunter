from diploma_app.db import db


class BugStep(db.Model):
    __tablename__ = 'bug_steps'
    id = db.Column(db.Integer, primary_key=True)

    bug_report_id = db.Column(db.Integer, db.ForeignKey('bug_reports.id', ondelete='CASCADE'), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    step_name = db.Column(db.String(255), nullable=False)

    bug_report = db.relationship('BugReport', back_populates='steps_to_reproduce')
