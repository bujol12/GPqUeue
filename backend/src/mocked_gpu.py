import random
from typing import Dict, Optional, Union

from enums.job_status import JobStatus
from gpu import GPU


class MockedGPU(GPU):
    def __init__(self, name, model, total_memory_mib):
        super().__init__(name, model, total_memory_mib)

    def get_stats(self) -> Dict[str, Union[Optional[str], float]]:
        self.fetch_stats()

        return {
            'last_status': str(self.last_status),
            'last_user': str(self.last_user) if self.last_user is not None else None,
            'last_utilisation_pct': self.last_utilisation_pct,
            'last_memory_used_mib': self.last_memory_used_mib
        }

    def fetch_stats(self):
        self.last_status = random.choice([e.value for e in JobStatus])
        self.last_user = None

        self.last_utilisation_pct = random.uniform(0, 1)
        self.last_memory_used_mib = float(
            random.randint(0, self.total_memory_mib)
        )
