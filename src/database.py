import os
import redis

database = redis.from_url(
    os.getenv("REDIS_URL", "redis://redis:6379")
)
