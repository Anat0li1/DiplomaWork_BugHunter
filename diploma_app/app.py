import os
from flask_jwt_extended import JWTManager
from flask import Flask
from flask_smorest import Api
from diploma_app.db import db
from diploma_app.resources.user import blp as UsersBlueprint
from dotenv import load_dotenv
from flask_migrate import Migrate
import diploma_app.models


load_dotenv(".dbenv")

def create_app():
    app = Flask(__name__)
    app.config["API_TITLE"] = "Stores REST API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config[
        "OPENAPI_SWAGGER_UI_URL"
    ] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["PROPAGATE_EXCEPTIONS"] = True
    migrate = Migrate(app, db)
    db.init_app(app)

    api = Api(app)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    jwt = JWTManager(app)

    # with app.app_context():
    #     import diploma_app.models
    #     db.create_all()

    api.register_blueprint(UsersBlueprint)
    # api.register_blueprint(ItemBlueprint)
    # api.register_blueprint(StoreBlueprint)
    # api.register_blueprint(TagBlueprint)

    return app