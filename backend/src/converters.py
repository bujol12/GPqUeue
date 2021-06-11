from datetime import datetime
from functools import singledispatchmethod
from typing import Any, Optional, Union

from src.types import ABCGPU, ABCJob, ABCUser


class Converters:
    @singledispatchmethod
    @classmethod
    def to_redis(cls, arg: Any) -> str:
        raise NotImplementedError(f'Unexpected arg: {arg} ({type(arg)})')

    @to_redis.register(ABCUser)
    @classmethod
    def _to_redis_user(cls, arg: ABCUser) -> str:
        return arg.get_id()

    @to_redis.register(ABCGPU)
    @classmethod
    def _to_redis_gpu(cls, arg: ABCGPU) -> str:
        return arg.get_id()

    @to_redis.register(ABCJob)
    @classmethod
    def _to_redis_job(cls, arg: ABCJob) -> str:
        return arg.get_id()

    @singledispatchmethod
    @classmethod
    def optional_datetime(cls, arg: Any) -> Optional[datetime]:
        raise NotImplementedError(f'Unexpected arg: {arg} ({type(arg)})')

    @optional_datetime.register(datetime)
    @optional_datetime.register(type(None))
    @classmethod
    def _optional_datetime_optional_datetime(
        cls,
        arg: Optional[datetime]
    ) -> Optional[datetime]:
        return arg

    @optional_datetime.register(int)
    @classmethod
    def _optional_datetime_float_or_int(
        cls,
        arg: Union[float, int]
    ) -> Optional[datetime]:
        return datetime.fromtimestamp(arg / 1000)
