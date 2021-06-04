from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from uuid import uuid4

import attr

from src.enums.job_status import JobStatus
from src.gpu import GPU
from src.user import User


@attr.define(slots=False, frozen=False)
class Job:
    name: str
    script_path: str
    cli_args: str = ''
    uuid: str = attr.ib(factory=lambda: str(uuid4().hex))

    user: Optional[User] = None
    gpus_list: List[GPU] = []

    start_time: Optional[datetime] = None
    finish_time: Optional[datetime] = None
    duration_ms: Optional[int] = None

    status: JobStatus = attr.ib(
        default=JobStatus.QUEUED,
        converter=lambda v: JobStatus(v)
    )

    def job_start(self, time: Optional[datetime] = None):
        self.start_time = time or datetime.now()

    def job_finished(self, time: datetime):
        self.finish_time = time
        assert self.start_time is not None
        self.duration_ms = int((time - self.start_time).total_seconds())

    def to_dict(self) -> Dict[str, str]:
        _dict: Dict[str, Union[str, Enum]] = attr.asdict(
            self,
            filter=lambda a, v: bool(v),
        )
        return dict([
            (k, v.value if isinstance(v, Enum) else v)
            for k, v in _dict.items()
        ])

    @staticmethod
    def from_dict(dict: Dict[str, Any]):
        return Job(**dict)
