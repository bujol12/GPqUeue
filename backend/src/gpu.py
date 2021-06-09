from __future__ import annotations

from functools import singledispatch
from typing import Any, Dict, Optional, Type, Union
from uuid import uuid4

import attr

from src.converters import Converters
from src.database import get_database
from src.enums.gpu_status import GpuStatus
from src.types import ABCGPU
from src.user import User


@attr.define(slots=False)
class GPU(ABCGPU):
    name: str
    model: str
    total_memory_mib: int
    uuid: str = attr.ib(factory=lambda: str(uuid4().hex))

    last_status: Optional[GpuStatus] = attr.ib(
        default=None,
        converter=attr.converters.optional(lambda x: GpuStatus(x)),
        metadata={'serializer': lambda x: x if x is None else str(x)}
    )
    last_user: Optional[User] = attr.ib(
        default=None,
        converter=attr.converters.optional(Converters.user_converter),
        metadata={'serializer': lambda x: x if x is None else attr.asdict(x)}
    )

    last_utilisation_pct: float = 0.0
    last_memory_used_mib: float = 0.0

    def get_stats(self):
        def _serializer(
            inst: type,
            field: attr.Attribute,
            value: Any
        ) -> Any:
            if field is None:
                return value
            if 'serializer' in field.metadata:
                return field.metadata['serializer'](value)

            return value

        return attr.asdict(
            self,
            recurse=True,
            value_serializer=_serializer,
        )

    def to_dict(self) -> Dict[str, Union[str, int, float]]:
        return self.get_stats()

    def dump(self) -> Dict[str, Union[str, int, float]]:
        return self.to_dict()

    def get_id(self) -> str:
        return self.uuid

    def get_DB_key(self) -> str:
        return self._get_DB_key(self.uuid)

    @staticmethod
    def _get_DB_key(uuid: str) -> str:
        return f'-GPU-{uuid}'

    @classmethod
    def load(cls, arg: Any) -> Optional[GPU]:
        return load(arg, cls)


@singledispatch
def load(arg: Any, cls: Type[GPU]) -> Optional[GPU]:
    raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")


@load.register(str)
def _load_str(arg: str, cls: Type[GPU]) -> Optional[GPU]:
    key: str = cls._get_DB_key(arg)
    _data: Dict[str, str] = get_database().fetch_key(key)

    if _data == {}:
        return None

    return cls(**_data)


@load.register
def _load_gpu(gpu: GPU, cls: Type[GPU]) -> Optional[GPU]:
    return gpu
