from datetime import datetime
from typing import List, Optional

import attr

from enums.job_status import JobStatus
from gpu import GPU
from user import User


@attr.define(slots=False, frozen=False)
class Job:
    name: str
    user: User
    status: JobStatus
    gpus_list: List[GPU]

    start_time: datetime
    finish_time: Optional[datetime] = None
    duration_ms: Optional[int] = None

    def job_finished(self, time: datetime):
        self.finish_time = time
        self.duration_ms = int((time - self.start_time).total_seconds())
