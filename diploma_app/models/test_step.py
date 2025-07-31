from diploma_app.db import db


class TestStep(db.Model):
    __tablename__ = 'test_steps'
    id = db.Column(db.Integer, primary_key=True)

    test_case_id = db.Column(db.Integer, db.ForeignKey('test_cases.id', ondelete='CASCADE'), nullable=False)
    number = db.Column(db.Integer, nullable=False)
    step_name = db.Column(db.String(255), nullable=False)
    test_data = db.Column(db.String(255))
    expected_result = db.Column(db.Text, nullable=False)

    test_case = db.relationship('TestCase', back_populates='steps')
