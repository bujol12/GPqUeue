from typing import Any, Optional

from enums.gpu_status import GpuStatus
from user import User


class GPU:
    name: str
    model: str
    total_memory_mib: int

    last_status: Optional[GpuStatus] = None
    last_user: Optional[User] = None

    last_utilisation_pct: float = 0.0
    last_memory_used_mib: float = 0.0

    def __init__(self, name, model, total_memory_mib):
        self.name = name
        self.model = model
        self.total_memory_mib = total_memory_mib
