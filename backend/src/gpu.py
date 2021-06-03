from typing import Any, Optional

import attr

from converters import Converters
from enums.gpu_status import GpuStatus
from user import User


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

        return attr.asdict(
            self,
            recurse=True,
            filter=lambda a, v: a.name.startswith('last_'),
            value_serializer=_serializer,
        )
