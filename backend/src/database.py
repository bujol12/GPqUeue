import json
import logging
from typing import Any, Dict, List, Optional

import redis

logger = logging.getLogger(__name__)


class Database:
    r: redis.StrictRedis = redis.StrictRedis(
        host='db', port=6379, db=0, encoding="utf-8", decode_responses=True)

    def add_key(self, key: str, value: Dict[str, Any]) -> bool:
        _value: Dict[str, str] = dict(
            [(k, json.dumps(v)) for k, v in value.items()])
        self.r.hmset(key, _value)

        return True

    def fetch_key(self, key: str) -> Dict[str, Any]:
        _dict: Dict[str, str] = self.r.hgetall(key)

        return dict([(k, json.loads(v)) for k, v in _dict.items()])

    def fetch_all_matching(self, field: str, value: Any) -> List[Any]:
        res = []
        for key in self.r.scan_iter("*"):
            tmp: Dict[str, str] = self.fetch_key(key)
            if field in tmp and tmp[field] == value:
                res.append(tmp)
        return res

    def exists_key(self, key: str) -> int:
        return self.r.exists(key)


REDIS: Optional[Database] = None


def setup_database() -> None:
    global REDIS
    REDIS = Database()


def get_database() -> Database:
    if REDIS is None:
        setup_database()

    assert REDIS is not None
    return REDIS
