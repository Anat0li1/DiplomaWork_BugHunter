import os
from flask_jwt_extended import JWTManager
from flask import Flask
from flask_smorest import Api
from diploma_app.db import db
from diploma_app.resources.user import blp as user_blueprint
from diploma_app.resources.shop import blp as shop_blueprint
from diploma_app.resources.product import blp as product_blueprint
from diploma_app.resources.order import blp as order_blueprint
from diploma_app.resources.cart_item import blp as cart_item_blueprint
from diploma_app.resources.test_case import blp as test_case_blueprint
from diploma_app.resources.bug_report import blp as bug_report_blueprint
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask import send_from_directory, abort



load_dotenv(".dbenv")

# def create_app():
#     app = Flask(__name__)
#
#     @app.route('/static/<path:filename>')
#     def static_files(filename):
#         return send_from_directory('frontend/static', filename)
#
#     @app.route('/<path:filename>')
#     def frontend_pages(filename):
#         return send_from_directory('frontend', filename)
#
#     app.config["API_TITLE"] = "Stores REST API"
#     app.config["API_VERSION"] = "v1"
#     app.config["OPENAPI_VERSION"] = "3.0.3"
#     app.config["OPENAPI_URL_PREFIX"] = "/"
#     app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
#     app.config[
#         "OPENAPI_SWAGGER_UI_URL"
#     ] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
#     app.config["API_SPEC_OPTIONS"] = {
#         "components": {
#             "securitySchemes": {
#                 "BearerAuth": {
#                     "type": "http",
#                     "scheme": "bearer",
#                     "bearerFormat": "JWT",
#                 }
#             }
#         },
#         "security": [{"BearerAuth": []}],
#     }
#     app.config["OPENAPI_SECURITY"] = [{"BearerAuth": []}]
#     app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
#     app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
#     app.config["PROPAGATE_EXCEPTIONS"] = True
#     migrate = Migrate(app, db)
#     db.init_app(app)
#
#     api = Api(app)
#
#     app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
#     jwt = JWTManager(app)
#
#     # with app.app_context():
#     #     import diploma_app.models
#     #     db.create_all()
#
#     api.register_blueprint(user_blueprint)
#     api.register_blueprint(shop_blueprint)
#     api.register_blueprint(product_blueprint)
#     api.register_blueprint(order_blueprint)
#     api.register_blueprint(cart_item_blueprint)
#     api.register_blueprint(test_case_blueprint)
#     api.register_blueprint(bug_report_blueprint)
#
#     return app

def create_app():
    app = Flask(__name__, static_folder="./frontend/static", template_folder="./frontend")

    app.config["API_TITLE"] = "Stores REST API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    app.config["API_SPEC_OPTIONS"] = {
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                }
            }
        },
        "security": [{"BearerAuth": []}],
    }
    app.config["OPENAPI_SECURITY"] = [{"BearerAuth": []}]
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["PROPAGATE_EXCEPTIONS"] = True
    migrate = Migrate(app, db)
    db.init_app(app)

    api = Api(app)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    jwt = JWTManager(app)

    api.register_blueprint(user_blueprint)
    api.register_blueprint(shop_blueprint)
    api.register_blueprint(product_blueprint)
    api.register_blueprint(order_blueprint)
    api.register_blueprint(cart_item_blueprint)
    api.register_blueprint(test_case_blueprint)
    api.register_blueprint(bug_report_blueprint)

    @app.route('/static/<path:filename>')
    def static_files(filename):
        full_path = os.path.join('frontend', 'static')
        if os.path.exists(os.path.join(full_path, filename)):
            return send_from_directory(full_path, filename)
        abort(404)

    @app.route('/<path:filename>')
    def frontend_pages(filename):
        full_path = os.path.join('frontend', filename)
        if os.path.exists(full_path):
            return send_from_directory('frontend', filename)
        abort(404)

    @app.route('/')
    def root():
        return send_from_directory('frontend', 'login.html')

    return app



