from __future__ import annotations

import json
import logging
import subprocess
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

logger = logging.getLogger(__name__)


@singledispatch
def _load_gpus_list(arg: Any) -> List[GPU]:
    return arg


@_load_gpus_list.register(list)
def _load_gpus_list_as_is(args: List[GPU]) -> List[GPU]:
    return [GPU.load(arg) for arg in args]


@_load_gpus_list.register(str)
def _load_gpus_list_json_string(arg: str) -> List[GPU]:
    res: Any = json.loads(arg)
    if isinstance(res, list):
        _list: List[GPU] = [gpu
                            for gpu in map(GPU.load, res)
                            if gpu is not None]
        return _list

    raise NotImplementedError(f"Unexpected decoded arg: {res} ({type(res)})")


@singledispatch
def _load_cli_args(arg: Any) -> Dict[str, str]:
    return arg


@_load_cli_args.register(dict)
def _load_cli_args_as_is(arg: Dict[str, str]) -> Dict[str, str]:
    return arg


@_load_cli_args.register(str)
def _load_cli_args_str(arg: str) -> Dict[str, str]:
    return json.loads(arg)


@attr.define(slots=False, frozen=False)
class Job(ABCJob):
    project: str
    name: str
    script_path: str
    cli_args: Dict[str, str] = attr.ib(
        default=dict(),
        converter=_load_cli_args,
    )
    user: User = attr.ib(
        default=None,
        converter=attr.converters.optional(User.load)
    )
    uuid: str = attr.ib(factory=lambda: str(uuid4().hex))
    gpus_list: List[GPU] = attr.ib(
        default=[],
        converter=_load_gpus_list
    )

    scheduled_time: datetime = attr.ib(
        factory=datetime.now,
        converter=Converters.optional_datetime,
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

    process: Optional[subprocess.Popen] = None

    def add_to_queue(self, gpu: GPU):
        curr_queue = gpu.fetch_queue()
        curr_queue.append(self.dump())
        logger.warning(curr_queue)
        gpu.set_queue(curr_queue)

    def start_job(self, time: Optional[datetime] = None):
        self.start_time = time or datetime.now()
        self.status = JobStatus.RUNNING

        self.commit()

    def run_job(self, time: Optional[datetime] = None):
        self.start_time = time or datetime.now()
        self.start_job(self.start_time)

        available_gpus = ",".join(
            map(lambda obj: obj.get_name(), self.gpus_list))

        if available_gpus != "":
            for gpu in self.gpus_list:
                gpu.set_busy()
            logger.warning("Running new process " + str(datetime.now()))
            self.process = subprocess.Popen(
                [f"export CUDA_VISIBLE_DEVICES={available_gpus};" + self.script_path], shell=True)
            logger.warning("Done new process " + str(datetime.now()))

        self.commit()

    def is_finished(self):
        if self.process is not None and self.process.poll() is not None:
            logger.warning("JOB FINISHED")
            return True
        return False

    def complete_job(self, time: datetime, success: bool = True):
        self.finish_time = time
        assert self.start_time is not None
        self.duration_ms = int((time - self.start_time).total_seconds())
        if success:
            self.status = JobStatus.COMPLETED
        else:
            self.status = JobStatus.FAILED

        for gpu in self.gpus_list:
            gpu.set_idle()

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

    @staticmethod
    def _serialisation_filter(_: attr.Attribute, v: Any) -> bool:
        return v is not None and not isinstance(v, subprocess.Popen)

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
        def _convert_datetime(arg: datetime) -> int:
            return int(arg.timestamp() * 1000)

        _dict: Dict[str, Union[str, Enum]] = attr.asdict(
            self,
            filter=self._serialisation_filter,
        )

        return dict([(k, _convert(v)) for k, v in _dict.items()])

    def dump(
        self,
        use_gpu_name: bool = False,
    ) -> Dict[str, Union[str, float, Optional[int]]]:
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
        def _converters_datetime(arg: datetime) -> int:
            return int(arg.timestamp() * 1000)

        @_converters.register(list)
        def _converters_list(args: List[GPU]) -> str:
            _list: List[str]
            if use_gpu_name:
                _list = [arg.get_name() for arg in args]
            else:
                _list = [arg.get_id() for arg in args]
            return json.dumps(_list)

        @_converters.register(dict)
        def _converters_dict(args: Dict[str, str]) -> str:
            return json.dumps(args)

        @_converters.register(User)
        def _converters_user(arg: User) -> str:
            return arg.get_id()

        _dict: Dict[str, Union[str, float, Optional[int]]]
        _dict = attr.asdict(
            self,
            filter=self._serialisation_filter,
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
