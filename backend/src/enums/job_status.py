from enum import Enum, unique


@unique
class JobStatus(Enum):
    QUEUED = 'QUEUED'
    RUNNING = 'RUNNING'
    FAILED = 'FAILED'
    CANCELLED = 'CANCELLED'
    COMPLETED = 'COMPLETED'
