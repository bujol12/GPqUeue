from __future__ import annotations

from functools import singledispatch
from typing import Any, Dict, Optional, Type

import attr

from src.database import get_database
from src.types import ABCUser


@attr.define()
class User(ABCUser):
    username: str
    hashed_pw: str
    email: str = ''
    first_name: str = ''
    surname: str = ''

    def is_authenticated(self) -> bool:
        if self.username:
            return True
        return False

    def is_active(self) -> bool:
        if self.username:
            return True
        return False

    def is_anonymous(self) -> bool:
        if self.username:
            return False
        return True

    def get_id(self) -> str:
        return self.username

    def get_DB_key(self) -> str:
        return self._get_DB_key(self.username)

    def to_dict(self, include_pw: bool = False) -> Dict[str, str]:
        def _filter(_attr: attr.Attribute, value: str) -> bool:
            return include_pw or _attr.name != 'hashed_pw'

        return attr.asdict(self, filter=_filter)

    def dump(self) -> Dict[str, str]:
        return self.to_dict(include_pw=True)

    @staticmethod
    def _get_DB_key(username: str) -> str:
        return f'-User-{username}'

    @classmethod
    def load(cls, arg: Any) -> Optional[User]:
        return load(arg, cls)


@singledispatch
def load(arg: Any, cls: Type[User]) -> Optional[User]:
    raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")


@load.register(str)
def _load_str(username: str, cls: Type[User]) -> Optional[User]:
    key: str = cls._get_DB_key(username)
    _data: Dict[str, str] = get_database().fetch_key(key)

    if _data == {}:
        return None

    return cls(**_data)


@load.register(dict)
def _load_dict(arg: Dict[str, str], cls: Type[User]) -> User:
    return cls(**arg)


@load.register
def _load_user(user: User, cls: Type[User]) -> User:
    return user
