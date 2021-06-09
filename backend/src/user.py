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
        return f'-User-{self.username}'

    def to_dict(self, include_pw: bool = False) -> Dict[str, str]:
        def _filter(_attr: attr.Attribute, value: str) -> bool:
            if include_pw:
                return True
            if _attr.name == 'hashed_pw':
                return False
            return True

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
