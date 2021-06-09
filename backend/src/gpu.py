from typing import Any, Optional

import attr

from src.converters import Converters
from src.enums.gpu_status import GpuStatus
from src.user import User


@attr.define(slots=False)
class GPU:
    name: str
    model: str
    total_memory_mib: int

    last_status: Optional[GpuStatus] = attr.ib(
        default=None,
        converter=attr.converters.optional(lambda x: GpuStatus(x)),
        metadata={'serializer': lambda x: x if x is None else str(x)}
    )
    last_user: Optional[User] = attr.ib(
        default=None,
        converter=attr.converters.optional(Converters.user_converter),
        metadata={'serializer': lambda x: x if x is None else attr.asdict(x)}
    )

    last_utilisation_pct: float = 0.0
    last_memory_used_mib: float = 0.0

    def get_stats(self):
        def _serializer(
            inst: type,
            field: attr.Attribute,
            value: Any
        ) -> Any:
            if field is None:
                return value
            if 'serializer' in field.metadata:
                return field.metadata['serializer'](value)

            return value

        data = attr.asdict(
            self,
            recurse=True,
            value_serializer=_serializer,
        )

        if data['last_user'] != None:
            # Only need username of user
            data['last_user'] = data['last_user']['username']

        return data
