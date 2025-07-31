from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import Blueprint, abort
from sqlalchemy import or_

from diploma_app.models.bug_report import BugReport
from diploma_app.models.bug_step import BugStep
from diploma_app.schemas.bug_report import BugReportSchema, BugReportPreview
from diploma_app.db import db

blp = Blueprint("BugReports", "bugreports", description="Operations on bug reports")

@blp.route("/bug-reports")
class BugReportsListCR(MethodView):
    @blp.response(200, BugReportPreview(many=True))
    @jwt_required()
    def get(self):
        bug_reports = BugReport.query.filter(or_(BugReport.user_id == get_jwt_identity(),
                                               BugReport.is_system == True)).all()
        if not bug_reports:
            abort(500, message="No bug reports found. Sth is wrong with database.")
        return [
            {
                "given_id": br.given_id,
                "title": br.title,
                "is_system": br.is_system,
                "priority": br.priority,
                "severity": br.severity
            }
            for br in bug_reports
        ]

    @blp.arguments(BugReportSchema)
    @blp.response(201, BugReportPreview)
    @jwt_required()
    def post(self, bug_report_data):
        steps_data = bug_report_data["steps"]
        bug_report = BugReport(**bug_report_data, user_id=get_jwt_identity())
        db.session.add(bug_report)
        db.session.flush()

        for step in steps_data:
            step_obj = BugStep(**step, bug_report_id=bug_report.id)
            db.session.add(step_obj)

        db.session.commit()
        return bug_report

@blp.route("/bug-report/<int:bug_id>")
class BugReportRUD(MethodView):
    @blp.response(200, BugReportSchema)
    @jwt_required()
    def get(self, bug_id):
        bug_report = BugReport.query.get_or_404(bug_id)
        if bug_report.user_id != get_jwt_identity():
            abort(403, message="Access denied, you can see only yours or system test cases")
        return bug_report

    @blp.arguments(BugReportSchema)
    @blp.response(201, BugReportSchema)
    @jwt_required()
    def put(self, bug_id, bug_report_data):
        bug_report = BugReport.query.get_or_404(bug_id)
        if bug_report.user_id != get_jwt_identity():
            abort(403, message="Access denied, you can edit only yours bug reports")
        bug_report.given_id = bug_report_data["given_id"]
        bug_report.title = bug_report_data["title"]
        bug_report.description = bug_report_data["description"]
        bug_report.preconditions = bug_report_data["preconditions"]
        bug_report.postconditions = bug_report_data["postconditions"]
        bug_report.actual_result = bug_report_data["actual_result"]
        bug_report.expected_result = bug_report_data["expected_result"]
        bug_report.severity = bug_report_data["severity"]
        bug_report.priority = bug_report_data["priority"]
        bug_report.status = bug_report_data["status"]
        bug_report.version = bug_report_data["version"]
        bug_report.environment = bug_report_data["environment"]
        bug_report.comments = bug_report_data["comments"]

        BugStep.query.filter_by(bug_id=bug_id).delete()

        for step_data in bug_report_data["steps"]:
            step = BugStep(
                number=step_data["number"],
                step_name=step_data["step_name"],
                bug_report_id=bug_report.id
            )
            db.session.add(step)

        db.session.commit()
        return bug_report

    @jwt_required()
    def delete(self, bug_id):
        bug_report = BugReport.query.get_or_404(bug_id)
        if bug_report.user_id != get_jwt_identity():
            abort(403, message="Access denied, you can delete only yours bug reports")
        db.session.delete(bug_report)
        db.session.commit()
        return {"message": "Bug report deleted"}, 200

@blp.route("/bug-report/<int:bug_id>/send-creator")
class BugReportSendToCreator(MethodView):
    def post(self, bug_id):
        bug_report = BugReport.query.get_or_404(bug_id)
        if bug_report.user_id != get_jwt_identity():
            abort(403, message="Access denied, you can send only yours bug reports to creators")
        #TODO: logic to send email with bug on my email address
        return {"message": "Bug report sent to creators"}, 200