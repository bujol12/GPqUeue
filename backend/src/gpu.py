from __future__ import annotations

import logging
from enum import Enum
from functools import singledispatch
from typing import Any, Dict, List, Optional, Type, Union
from uuid import uuid4

import attr

from src.database import get_database
from src.enums.gpu_status import GpuStatus
from src.types import ABCGPU
from src.user import User

logger = logging.getLogger(__name__)

@attr.define(slots=False)
class GPU(ABCGPU):
    name: str
    model: str
    total_memory_mib: int
    uuid: str
    last_status: Optional[GpuStatus] = attr.ib(
        default=GpuStatus.IDLE,
        converter=attr.converters.optional(lambda x: GpuStatus(x)),
        metadata={'serializer': lambda x: x if x is None else str(x)}
    )
    last_user: Optional[User] = attr.ib(
        default=None,
        converter=attr.converters.optional(User.load),
        metadata={'serializer': lambda x: x if x is None else attr.asdict(x)}
    )

    last_utilisation_pct: float = 0.0
    last_memory_used_mib: float = 0.0

    def get_queue_key(self):
        return "gpu_queue_" + self.name

    def set_queue(self, new_queue: List[Dict[str, Any]]) -> None:
        get_database().add_key(
            self.get_queue_key(),
            {'queue': [v for v in new_queue]},
        )

    def is_idle(self):
        BUSY_PCT_THRESHOLD = 0.10
        self.get_stats()
        return self.last_status == GpuStatus.IDLE
        #and (self.last_memory_used_mib / self.total_memory_mib) < BUSY_PCT_THRESHOLD

    def fetch_queue(self) -> List[Dict[str, Any]]:
        queue = get_database().fetch_key(self.get_queue_key()).get('queue', [])
        return queue

    def set_idle(self):
        self.last_status = GpuStatus.IDLE


    def set_busy(self):
        self.last_status = GpuStatus.BUSY

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

        data = attr.asdict(
            self,
            recurse=True,
            value_serializer=_serializer,
        )

        if data['last_user'] != None:
            # Only need username of user
            data['last_user'] = data['last_user']['username']

        return data

    def to_dict(self) -> Dict[str, Union[str, int, float, Dict[str, Any]]]:
        return self.get_stats()

    def dump(self) -> Dict[str, Union[str, int, float]]:
        @singledispatch
        def _converters(arg: Any) -> Union[str, float, Optional[int]]:
            raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")

        @_converters.register(str)
        @_converters.register(int)
        @_converters.register(float)
        def _converters_as_is(arg: Union[str, float, int]):
            return arg

        @_converters.register(Enum)
        def _converters_enum(arg: Enum) -> str:
            return arg.value

        @_converters.register(User)
        def _converters_user(arg: User) -> str:
            return arg.get_id()

        _dict: Dict[str, Union[str, int, float]] = attr.asdict(
            self,
            filter=lambda a, v: v is not None,
            recurse=False,
            value_serializer=lambda inst, a, v: _converters(v),
        )

        return _dict

    def get_id(self) -> str:
        return self.uuid

    def get_DB_key(self) -> str:
        return self._get_DB_key(self.uuid)

    def get_name(self) -> str:
        return self.name

    @staticmethod
    def _get_DB_key(uuid: str) -> str:
        return f'-GPU-{uuid}'

    def commit(self) -> bool:
        return get_database().add_key(self.get_DB_key(), self.dump())

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


@load.register(dict)
def _load_dict(arg: Dict[str, str], cls: Type[GPU]) -> GPU:
    return cls(**arg)


@load.register
def _load_gpu(gpu: GPU, cls: Type[GPU]) -> GPU:
    return gpu
