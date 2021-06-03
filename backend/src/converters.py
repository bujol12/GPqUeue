from functools import singledispatchmethod
from typing import Dict

from src.user import User


class Converters:
    @singledispatchmethod
    @classmethod
    def user_converter(cls, arg) -> User:
        raise NotImplementedError(f"Expect Dict or User, received {type(arg)}")

    @user_converter.register(dict)
    @classmethod
    def _user_converter_dict(cls, arg: Dict[str, str]) -> User:
        return User(**arg)

    @user_converter.register(User)
    @classmethod
    def _user_converter_user(cls, arg: User) -> User:
        return arg
