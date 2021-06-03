from datetime import datetime
from typing import List, Optional

from enums.job_status import JobStatus
from gpu import GPU
from user import User


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
        self.duration_ms = (time - self.start_time).total_seconds()