from enum import Enum


class JobStatus(Enum):
    QUEUED = 'QUEUED'
    RUNNING = 'RUNNING'
    FAILED = 'FAILED'
    COMPLETED = 'COMPLETED'
