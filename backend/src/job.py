from __future__ import annotations

import json
from datetime import datetime
from enum import Enum
from functools import singledispatch
from typing import Any, Dict, List, Optional, Type, Union
from uuid import uuid4

import attr

from src.converters import Converters
from src.database import get_database
from src.enums.job_status import JobStatus
from src.gpu import GPU
from src.types import ABCJob
from src.user import User


@singledispatch
def _load_gpus_list(arg: Any) -> List[GPU]:
    raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")


@_load_gpus_list.register(list)
def _load_gpus_list_as_is(arg: List[GPU]) -> List[GPU]:
    return arg


@_load_gpus_list.register(str)
def _load_gpus_list_json_string(arg: str) -> List[GPU]:
    res: Any = json.loads(arg)
    if isinstance(res, list):
        _list: List[GPU] = [gpu
                            for gpu in map(GPU.load, res)
                            if gpu is not None]
        return _list

    raise NotImplementedError(f"Unexpected decoded arg: {res} ({type(res)})")


@attr.define(slots=False, frozen=False)
class Job(ABCJob):
    name: str
    script_path: str
    cli_args: str = ''
    uuid: str = attr.ib(factory=lambda: str(uuid4().hex))

    user: Optional[User] = attr.ib(
        default=None,
        converter=attr.converters.optional(User.load),
    )
    gpus_list: List[GPU] = attr.ib(
        default=[],
        converter=_load_gpus_list
    )

    start_time: Optional[datetime] = attr.ib(
        default=None,
        converter=Converters.optional_datetime,
    )
    finish_time: Optional[datetime] = attr.ib(
        default=None,
        converter=Converters.optional_datetime,
    )
    duration_ms: Optional[int] = None

    status: JobStatus = attr.ib(
        default=JobStatus.QUEUED,
        converter=lambda v: JobStatus(v)
    )

    def start_job(self, time: Optional[datetime] = None):
        self.start_time = time or datetime.now()
        self.status = JobStatus.RUNNING

        self.commit()

    def complete_job(self, time: datetime, success: bool = True):
        self.finish_time = time
        assert self.start_time is not None
        self.duration_ms = int((time - self.start_time).total_seconds())
        if success:
            self.status = JobStatus.COMPLETED
        else:
            self.status = JobStatus.FAILED

        self.commit()

    def cancel_job(self, time: Optional[datetime] = None):
        self.finish_time = time or datetime.now()
        if self.status == JobStatus.RUNNING:
            assert self.start_time is not None
            self.duration_ms = int(
                (self.finish_time - self.start_time).total_seconds())

        self.status = JobStatus.CANCELLED

        self.commit()

    def get_id(self) -> str:
        return self.uuid

    def get_DB_key(self) -> str:
        return self._get_DB_key(self.get_id())

    @staticmethod
    def _get_DB_key(uuid: str) -> str:
        return f'-Job-{uuid}'

    def to_dict(self) -> Dict[str, Union[str, float, int, Dict[str, Any]]]:
        @singledispatch
        def _convert(arg: Any) -> Union[str, float, int, Dict[str, Any]]:
            raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")

        @_convert.register(str)
        @_convert.register(int)
        @_convert.register(float)
        @_convert.register(list)
        @_convert.register(dict)
        def _convert_as_is(
            arg: Union[str, float, int, Dict[str, Any]]
        ) -> Union[str, float, int, Dict[str, Any]]:
            return arg

        @_convert.register(Enum)
        def _convert_enum(arg: Enum) -> str:
            return arg.value

        @_convert.register(datetime)
        def _covnert_datetime(arg: datetime) -> float:
            return arg.timestamp()

        _dict: Dict[str, Union[str, Enum]] = attr.asdict(
            self,
            filter=lambda a, v: v is not None,
        )

        return dict([(k, _convert(v)) for k, v in _dict.items()])

    def dump(self) -> Dict[str, Union[str, float, Optional[int]]]:
        @singledispatch
        def _converters(arg: Any) -> Union[str, float, Optional[int]]:
            raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")

        @_converters.register(str)
        @_converters.register(int)
        @_converters.register(type(None))
        def _converters_as_is(arg: Union[str, Optional[int]]):
            return arg

        @_converters.register(Enum)
        def _converters_enum(arg: Enum) -> str:
            return arg.value

        @_converters.register(datetime)
        def _converters_datetime(arg: datetime) -> float:
            return arg.timestamp()

        @_converters.register(list)
        def _converters_list(args: List[GPU]) -> str:
            _list: List[str] = [arg.get_id() for arg in args]
            return json.dumps(_list)

        @_converters.register(User)
        def _converters_user(arg: User) -> str:
            return arg.get_id()

        _dict: Dict[str, Union[str, float, Optional[int]]]
        _dict = attr.asdict(
            self,
            filter=lambda a, v: v is not None,
            recurse=False,
            value_serializer=lambda inst, a, v: _converters(v),
        )

        return _dict

    def commit(self) -> bool:
        return get_database().add_key(self.get_DB_key(), self.dump())

    @staticmethod
    def from_dict(dict: Dict[str, Any]):
        return Job(**dict)

    @classmethod
    def load(cls, arg: Any) -> Optional[Job]:
        return load(arg, cls)


@singledispatch
def load(arg: Any, cls: Type[Job]) -> Optional[Job]:
    raise NotImplementedError(f"Unexpected arg: {arg} ({type(arg)})")


@load.register(str)
def _load_str(arg: str, cls: Type[Job]) -> Optional[Job]:
    key: str = cls._get_DB_key(arg)
    _data: Dict[str, Union[str, float, Optional[int]]]
    _data = get_database().fetch_key(key)

    if _data == {}:
        return None

    return cls(**_data)


@load.register(dict)
def _load_dict(
    arg: Dict[str, Union[str, float, Optional[int]]],
    cls: Type[Job]
) -> Job:
    return cls(**arg)


@load.register
def _load_job(arg: Job, cls: Type[Job]) -> Job:
    return arg
