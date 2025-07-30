import datetime

from flask.views import MethodView
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                get_jwt, get_jwt_identity, jwt_required)
from flask_smorest import Blueprint, abort
from passlib.hash import pbkdf2_sha256

from diploma_app.resources.blocklist import BLOCKLIST
from diploma_app.db import db
from sqlalchemy import or_
from diploma_app.models.user import User
from diploma_app.schemas.user import UserRegisterSchema, UserSchema

blp = Blueprint("Users", "users", description="Operations on users")

@blp.route("/register")
class UserRegister(MethodView):
    @blp.arguments(UserRegisterSchema)
    def post(self, user_data):
        if User.query.filter(or_(
                User.username == user_data["username"],
                User.email == user_data["email"])).first():
            abort(409, message="A user with that username or email already exists.")

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password=pbkdf2_sha256.hash(user_data["password"]),
            created_at=datetime.datetime.now(tz=datetime.timezone.utc),
            active_role="admin"
        )
        db.session.add(user)
        db.session.commit()

        return {"message": "User created successfully."}, 201

@blp.route("/login")
class UserLogin(MethodView):
    @blp.arguments(UserSchema)
    def post(self, user_data):
        user = User.query.filter(User.email == user_data["email"]).first()

        if user and pbkdf2_sha256.verify(user_data["password"], user.password):
            access_token = create_access_token(identity=str(user.id), fresh=True)
            refresh_token = create_refresh_token(str(user.id))
            return {"access_token": access_token, "refresh_token": refresh_token}, 200

        abort(401, message="Invalid credentials.")

@blp.route("/logout")
class UserLogout(MethodView):
    @jwt_required()
    def post(self):
        jti = get_jwt()["jti"]
        BLOCKLIST.add(jti)
        return {"message": "Successfully logged out"}, 200


@blp.route("/user")
class UserInfo(MethodView):
    @blp.response(200)
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        return {"email": user.email, "username": user.username}, 200

    @jwt_required()
    def delete(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted."}, 200

    @jwt_required()
    @blp.arguments(UserRegisterSchema)
    def patch(self, user_data):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        if "username" in user_data:
            user.username = user_data["username"]
        if "email" in user_data:
            user.email = user_data["email"]
        if "password" in user_data:
            user.password = pbkdf2_sha256.hash(user_data["password"])
        db.session.commit()

        return {"message": "User updated successfully."}, 200

@blp.route("/change_role", methods=["POST", "GET"])
@jwt_required()
def change_role():
    user = User.query.get_or_404(get_jwt_identity())
    user.active_role = "user" if user.active_role == "admin" else "admin"
    db.session.commit()
    return {"message": "Role changed successfully."}, 200


@blp.route("/refresh")
class TokenRefresh(MethodView):
    @jwt_required(refresh=True)
    def post(self):
        current_user = get_jwt_identity()
        new_token = create_access_token(identity=current_user, fresh=False)
        jti = get_jwt()["jti"]
        BLOCKLIST.add(jti)
        return {"access_token": new_token}, 200