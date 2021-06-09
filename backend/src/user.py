from __future__ import annotations
from typing import Dict, Optional

import attr

from src.database import get_database


@attr.define()
class User:
    username: str
    hashed_pw: str
    email: str = ''
    first_name: str = ''
    surname: str = ''

    @staticmethod
    def is_authenticated() -> bool:
        return True

    @staticmethod
    def is_active() -> bool:
        return True

    @staticmethod
    def is_anonymous() -> bool:
        return False

    def get_id(self) -> str:
        return self.username

    def get_DB_key(self) -> str:
        return f'-User-{self.username}'

    def to_dict(self, include_pw: bool = False) -> Dict[str, str]:
        def _filter(_attr: attr.Attribute, value: str) -> bool:
            return include_pw or _attr.name != 'hashed_pw'

        return attr.asdict(self, filter=_filter)

    @staticmethod
    def _get_DB_key(username: str) -> str:
        return f'-User-{username}'

    @classmethod
    def load(cls, username: str) -> Optional[User]:
        key: str = cls._get_DB_key(username)
        _data: Dict[str, str] = get_database().fetch_key(key)

        if _data == {}:
            return None

        return cls(**_data)
