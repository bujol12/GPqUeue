import logging

from typing import Dict, Any, List

import redis


logger = logging.getLogger(__name__)

class Database:
    r: redis.StrictRedis = redis.StrictRedis(host='db', port=6379, db=0, charset="utf-8", decode_responses=True)

    def add_key(self, key: str, value: Dict[str, Any]) -> bool:
        self.r.hmset(key, value)
        return False

    def fetch_key(self, key: str) -> Dict:
        return self.r.hgetall(key)

    def fetch_all_matching(self, field: str, value) -> List:
        res = []
        for key in self.r.scan_iter("*"):
            tmp = self.fetch_key(key)

            logger.warning(tmp.get('status'))

            if tmp[field] == value:
                res.append(tmp)
        return res
