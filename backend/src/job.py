from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import uuid4

import attr

from enums.job_status import JobStatus
from gpu import GPU
from user import User


@attr.define(slots=False, frozen=False)
class Job:
    uuid: str
    name: str
    user: User
    status: JobStatus
    gpus_list: List[GPU]

    script_path: str
    cli_args: str

    start_time: datetime
    finish_time: Optional[datetime] = None
    duration_ms: Optional[int] = None

    def __init__(self, name: str, script_path: str, cli_args: str):
        self.uuid = str(uuid4().hex)
        self.name = name
        self.script_path = script_path
        self.cli_args = cli_args

    def job_finished(self, time: datetime):
        self.finish_time = time
        self.duration_ms = int((time - self.start_time).total_seconds())

    def to_dict(self):
        return {'uuid': self.uuid, 'name': self.name, 'script_path': self.script_path, 'cli_args': self.cli_args}

    @staticmethod
    def from_dict(self, dict: Dict[str, Any]):
        return Job(**dict)