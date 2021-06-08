import random
from typing import Dict, Optional, Union

import attr

from src.enums.job_status import JobStatus
from src.gpu import GPU
from src.user import User


@attr.define(slots=False)
class MockedGPU(GPU):
    users = [
        "Delilah Han",
        "Joe Stacey",
        "Sherry Edwards"
    ]

    def get_stats(self) -> Dict[str, Union[Optional[str], float]]:
        self.fetch_stats()

        return super().get_stats()

    def fetch_stats(self) -> None:
        self.last_status = random.choice([e.value for e in JobStatus])
        if random.random() < 0.5:
            self.last_user = None
        else:
            self.last_user = User(username=random.choice(self.users), hashed_pw="")

        self.last_utilisation_pct = random.uniform(0, 1)
        self.last_memory_used_mib = float(
            random.randint(0, self.total_memory_mib)
        )
