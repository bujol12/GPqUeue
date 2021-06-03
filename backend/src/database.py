from typing import *

import redis


class Database:
    redis = redis.StrictRedis(host='localhost', port=6379, db=0)

    def add_key(self, key: str, value) -> bool:
        pass

    def fetch_key(self, key: str) -> Dict:
        pass

    def fetch_all_matching(self, field: str, value) -> List:
        pass
