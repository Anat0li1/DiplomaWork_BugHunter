from marshmallow import Schema, fields


class UserRegisterSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)
    username = fields.Str(required=True)

class UserSchema(Schema):
    email = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)