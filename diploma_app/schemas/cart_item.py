from marshmallow import Schema, fields


class CartItemSchema(Schema):
    id = fields.Integer(dump_only=True)
    product_id = fields.Integer(required=True)
    quantity = fields.Integer(required=True)