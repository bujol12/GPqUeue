from flask import Blueprint
from flask_login import login_required, login_user, logout_user
from webargs import fields
from webargs.flaskparser import use_args

from src.database import get_database
from src.user import User

bp = Blueprint('auth', __name__)


@bp.route("/signup", methods=['GET', 'POST'])
@use_args({
    'username': fields.Str(required=True),
    'password': fields.Str(required=True),
}, location='json')
def signup(args):
    username: str = args['username']
    password: str = args['password']
    hashed_pw: str = password
    user = User(username=username, hashed_pw=hashed_pw)
    key = user.get_DB_key()
    if get_database().exists_key(key) > 0:
        return {
            "status": "failed",
            "error": "user-exists",
        }

    get_database().add_key(key, user.dump())
    login_user(user)

    return {"status": "success"}


@bp.route("/login", methods=['GET', 'POST'])
@use_args({
    'username': fields.Str(required=True),
    'password': fields.Str(required=True),
}, location='json')
def login(args):
    username: str = args['username']
    password: str = args['password']
    user = User.load(username)
    if user is None:
        return {
            "status": "failed",
            "error": "incorrect-username"
        }
    if user.hashed_pw == password:
        login_user(user)

        return {"status": "success"}
    else:
        return {
            "status": "failed",
            "error": "incorrect-password"
        }


@bp.route("/logout", methods=['GET'])
@login_required
def logout():
    logout_user()
    return {"status": "success"}
