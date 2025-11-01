from marshmallow import Schema, fields


class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(required=True)
    price = fields.Float(required=True)
    quantity = fields.Int(required=True)
    image_url = fields.Str(allow_none=True)
    category = fields.Str(allow_none=True) 
