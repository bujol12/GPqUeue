import random
from typing import Dict, Optional, Union

import attr

from src.enums.job_status import JobStatus
from src.gpu import GPU


@attr.define(slots=False)
class MockedGPU(GPU):
    def get_stats(self) -> Dict[str, Union[Optional[str], float]]:
        self.fetch_stats()

        return super().get_stats()

    def fetch_stats(self) -> None:
        self.last_status = random.choice([e.value for e in JobStatus])
        self.last_user = None

        self.last_utilisation_pct = random.uniform(0, 1)
        self.last_memory_used_mib = float(
            random.randint(0, self.total_memory_mib)
        )
