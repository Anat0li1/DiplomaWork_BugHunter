from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import Blueprint, abort
from sqlalchemy import or_

from diploma_app.models.test_case import TestCase
from diploma_app.models.test_step import TestStep
from diploma_app.schemas.test_case import TestCaseSchema, TestCasePreview
from diploma_app.db import db

blp = Blueprint("TestCases", "testcases", description="Operations on test cases")

@blp.route("/test-cases")
class TestCaseListCR(MethodView):
    @blp.arguments(TestCaseSchema)
    @blp.response(201, TestCaseSchema)
    @jwt_required()
    def post(self, test_case_data):
        steps_data = test_case_data.pop("steps")
        test_case = TestCase(**test_case_data, user_id=get_jwt_identity())
        db.session.add(test_case)
        db.session.flush()

        for step in steps_data:
            step_obj = TestStep(**step, test_case_id=test_case.id)
            db.session.add(step_obj)

        db.session.commit()
        return test_case

    @blp.response(200, TestCasePreview(many=True))
    @jwt_required()
    def get(self):
        test_cases = TestCase.query.filter(or_(TestCase.user_id==get_jwt_identity(),
                                               TestCase.is_system == True)).all()
        if not test_cases:
            abort(500, message="No test cases found. Sth is wrong with database.")
        return [
            {
                "given_id": tc.given_id,
                "title": tc.title,
                "is_system": tc.is_system,
                "priority": tc.priority
            }
            for tc in test_cases
        ]

@blp.route("/test-cases/<int:test_case_id>")
class TestCaseRUD(MethodView):
    @blp.response(200, TestCaseSchema)
    @jwt_required()
    def get(self, test_case_id):
        user_id = get_jwt_identity()
        test_case = TestCase.query.get_or_404(test_case_id)
        if test_case.user_id != user_id:
            abort(403, message="Access denied, you can see only yours or system test cases.")
        return test_case

    @blp.arguments(TestCaseSchema)
    @blp.response(200, TestCaseSchema)
    @jwt_required()
    def put(self, update_data, test_case_id):
        user_id = get_jwt_identity()
        test_case = TestCase.query.get_or_404(test_case_id)
        if test_case.user_id != user_id:
            abort(403, message="You are not the owner of this test case.")
        test_case.given_id = update_data["given_id"]
        test_case.title = update_data["title"]
        test_case.description = update_data["description"]
        test_case.version = update_data["version"]
        test_case.environment = update_data["environment"]
        test_case.priority = update_data["priority"]
        test_case.preconditions = update_data.get("preconditions")
        test_case.postconditions = update_data.get("postconditions")
        test_case.comments = update_data.get("comments")

        TestStep.query.filter_by(test_case_id=test_case.id).delete()

        for step_data in update_data["steps"]:
            step = TestStep(
                number=step_data["number"],
                step_name=step_data["step_name"],
                test_data=step_data.get("test_data"),
                expected_result=step_data["expected_result"],
                test_case_id=test_case.id
            )
            db.session.add(step)

        db.session.commit()
        return test_case

    @jwt_required()
    def delete(self, test_case_id):
        user_id = get_jwt_identity()
        test_case = TestCase.query.get_or_404(test_case_id)
        if test_case.user_id != user_id:
            abort(403, message="Access denied, you are not the owner of this test case.")
        db.session.delete(test_case)
        db.session.commit()
        return {"message": "Successfully deleted test case."}, 200