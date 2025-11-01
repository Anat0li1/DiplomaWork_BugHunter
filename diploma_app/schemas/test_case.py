from marshmallow import Schema, fields


class TestStepSchema(Schema):
    id = fields.Int(dump_only=True)
    number = fields.Int(required=True)
    step_name = fields.Str(required=True)
    test_data = fields.Str(allow_none=True)
    expected_result = fields.Str(required=True)
    test_case_id = fields.Int(load_only=True)

class TestCaseSchema(Schema):
    id = fields.Int(dump_only=True)
    given_id = fields.Int(required=True)
    application_group = fields.Str(allow_none=True)

    title = fields.Str(required=True)
    description = fields.Str(required=True)
    priority = fields.Str(required=True)
    is_system = fields.Bool()

    preconditions = fields.Str(allow_none=True)
    postconditions = fields.Str(allow_none=True)

    version = fields.Str(required=True)
    environment = fields.Str(required=True)

    user_id = fields.Int(load_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    comments = fields.Str(allow_none=True)

    steps = fields.List(fields.Nested(TestStepSchema), required=True)


class TestCasePreview(Schema):
    given_id = fields.Int(required=True)
    title = fields.Str(required=True)
    application_group = fields.Str(allow_none=True)
    is_system = fields.Bool()
    priority = fields.Str(required=True)

