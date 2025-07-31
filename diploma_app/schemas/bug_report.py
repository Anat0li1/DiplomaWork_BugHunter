from marshmallow import Schema, fields


class BugStepSchema(Schema):
    id = fields.Int(dump_only=True)
    number = fields.Int(required=True)
    step_name = fields.Str(required=True)
    bug_report_id = fields.Int(load_only=True)

class BugReportSchema(Schema):
    id = fields.Int(dump_only=True)
    given_id = fields.Int(required=True)

    title = fields.Str(required=True)
    description = fields.Str(required=True)

    actual_result = fields.Str(required=True)
    expected_result = fields.Str(required=True)

    severity = fields.Str(required=True)
    priority = fields.Str(required=True)
    status = fields.Str(required=True)
    is_system = fields.Bool()

    preconditions = fields.Str(allow_none=True)
    postconditions = fields.Str(allow_none=True)

    version = fields.Str(required=True)
    environment = fields.Str(required=True)

    user_id = fields.Int(load_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    comments = fields.Str(allow_none=True)

    steps = fields.List(fields.Nested(BugStepSchema), required=True)


class BugReportPreview(Schema):
    given_id = fields.Int(required=True)
    title = fields.Str(required=True)
    is_system = fields.Bool()
    priority = fields.Str(required=True)
    severity = fields.Str(required=True)

