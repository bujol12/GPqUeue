from typing import *
from datetime import datetime

from user import User
from enums.job_status import JobStatus
from gpu import GPU


class Job:
    start_time: datetime
    finish_time: Optional[datetime]
    duration_ms: Optional[int]

    name: str
    user: User
    status: JobStatus
    gpus_lst: List[GPU]

    def job_finished(self, time: datetime):
        self.finish_time = time
        self.duration_ms = (time - self.start_time).total_seconds()