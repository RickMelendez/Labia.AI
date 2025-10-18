"""
Redis Cache Client
Handles caching of AI responses and rate limiting
"""
import json
from typing import Optional, Any, Dict
from datetime import timedelta
import redis.asyncio as redis
from loguru import logger

from ...core.config import settings
from ...core.exceptions import CacheException


class RedisClient:
    """
    Async Redis client for caching and rate limiting

    Features:
    - Response caching (reduce LLM API calls)
    - Rate limiting (track user usage)
    - Session storage
    - Key-based expiration

    Usage:
        cache = RedisClient()
        await cache.connect()

        # Cache AI response
        await cache.set("opener:hash123", response_data, ttl=3600)
        cached = await cache.get("opener:hash123")

        # Rate limiting
        count = await cache.increment_rate_limit("user:123", ttl=86400)
    """

    def __init__(self):
        """Initialize Redis client (connection happens in connect())"""
        self.client: Optional[redis.Redis] = None
        self.connected = False

    async def connect(self) -> None:
        """
        Connect to Redis server

        Raises:
            CacheException: If connection fails
        """
        try:
            self.client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
            )

            # Test connection
            await self.client.ping()
            self.connected = True
            logger.info(f"Redis connected: {settings.REDIS_URL}")

        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise CacheException(f"Redis connection failed: {e}")

    async def disconnect(self) -> None:
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            self.connected = False
            logger.info("Redis disconnected")

    async def ping(self) -> bool:
        """
        Check if Redis is responsive

        Returns:
            bool: True if Redis responds to ping
        """
        try:
            if not self.client:
                return False
            await self.client.ping()
            return True
        except Exception:
            return False

    # ==================== Basic Operations ====================

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value (deserialized from JSON) or None if not found

        Example:
            >>> value = await cache.get("opener:user123:hash456")
            >>> if value:
            >>>     print(f"Cache hit: {value}")
        """
        try:
            if not self.client:
                logger.warning("Redis client not connected")
                return None

            value = await self.client.get(key)

            if value is None:
                logger.debug(f"Cache miss: {key}")
                return None

            # Deserialize JSON
            deserialized = json.loads(value)
            logger.debug(f"Cache hit: {key}")
            return deserialized

        except json.JSONDecodeError as e:
            logger.error(f"Failed to deserialize cache value for key {key}: {e}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set value in cache with optional TTL

        Args:
            key: Cache key
            value: Value to cache (will be serialized to JSON)
            ttl: Time-to-live in seconds (default: settings.REDIS_CACHE_TTL)

        Returns:
            bool: True if successful

        Example:
            >>> await cache.set("opener:hash123", {"text": "¡Wepa!"}, ttl=3600)
        """
        try:
            if not self.client:
                logger.warning("Redis client not connected")
                return False

            # Serialize to JSON
            serialized = json.dumps(value, ensure_ascii=False)

            # Set with TTL
            if ttl is None:
                ttl = settings.REDIS_CACHE_TTL

            await self.client.setex(key, ttl, serialized)
            logger.debug(f"Cache set: {key} (TTL: {ttl}s)")
            return True

        except (TypeError, ValueError) as e:
            logger.error(f"Failed to serialize value for key {key}: {e}")
            return False
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete key from cache

        Args:
            key: Cache key

        Returns:
            bool: True if key was deleted

        Example:
            >>> await cache.delete("opener:hash123")
        """
        try:
            if not self.client:
                logger.warning("Redis client not connected")
                return False

            result = await self.client.delete(key)
            logger.debug(f"Cache delete: {key} (deleted: {bool(result)})")
            return bool(result)

        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache

        Args:
            key: Cache key

        Returns:
            bool: True if key exists

        Example:
            >>> if await cache.exists("opener:hash123"):
            >>>     print("Key exists")
        """
        try:
            if not self.client:
                return False

            result = await self.client.exists(key)
            return bool(result)

        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False

    async def expire(self, key: str, ttl: int) -> bool:
        """
        Set expiration time for existing key

        Args:
            key: Cache key
            ttl: Time-to-live in seconds

        Returns:
            bool: True if expiration was set

        Example:
            >>> await cache.expire("opener:hash123", 1800)  # 30 minutes
        """
        try:
            if not self.client:
                return False

            result = await self.client.expire(key, ttl)
            return bool(result)

        except Exception as e:
            logger.error(f"Cache expire error for key {key}: {e}")
            return False

    # ==================== Rate Limiting ====================

    async def increment_rate_limit(self, key: str, ttl: int = None) -> int:
        """
        Increment rate limit counter for a key

        Args:
            key: Rate limit key (e.g., "rate:user:123")
            ttl: Time-to-live in seconds (default: REDIS_RATE_LIMIT_TTL)

        Returns:
            int: New counter value

        Example:
            >>> count = await cache.increment_rate_limit("rate:user:123", ttl=86400)
            >>> if count > 10:
            >>>     raise RateLimitException("Daily limit exceeded")
        """
        try:
            if not self.client:
                logger.warning("Redis client not connected")
                return 0

            # Increment counter
            count = await self.client.incr(key)

            # Set expiration on first increment
            if count == 1:
                if ttl is None:
                    ttl = settings.REDIS_RATE_LIMIT_TTL
                await self.client.expire(key, ttl)

            logger.debug(f"Rate limit incremented: {key} = {count}")
            return count

        except Exception as e:
            logger.error(f"Rate limit increment error for key {key}: {e}")
            return 0

    async def get_rate_limit(self, key: str) -> int:
        """
        Get current rate limit counter value

        Args:
            key: Rate limit key

        Returns:
            int: Current counter value

        Example:
            >>> count = await cache.get_rate_limit("rate:user:123")
            >>> remaining = 100 - count
        """
        try:
            if not self.client:
                return 0

            value = await self.client.get(key)
            return int(value) if value else 0

        except Exception as e:
            logger.error(f"Rate limit get error for key {key}: {e}")
            return 0

    async def reset_rate_limit(self, key: str) -> bool:
        """
        Reset rate limit counter to 0

        Args:
            key: Rate limit key

        Returns:
            bool: True if reset was successful

        Example:
            >>> await cache.reset_rate_limit("rate:user:123")
        """
        return await self.delete(key)

    async def get_ttl(self, key: str) -> int:
        """
        Get remaining TTL for a key

        Args:
            key: Cache key

        Returns:
            int: Remaining TTL in seconds (-1 if no expiration, -2 if key doesn't exist)

        Example:
            >>> ttl = await cache.get_ttl("rate:user:123")
            >>> print(f"Resets in {ttl} seconds")
        """
        try:
            if not self.client:
                return -2

            ttl = await self.client.ttl(key)
            return ttl

        except Exception as e:
            logger.error(f"TTL get error for key {key}: {e}")
            return -2

    # ==================== Bulk Operations ====================

    async def get_many(self, keys: list[str]) -> Dict[str, Any]:
        """
        Get multiple keys at once

        Args:
            keys: List of cache keys

        Returns:
            dict: {key: value} for all found keys

        Example:
            >>> values = await cache.get_many(["key1", "key2", "key3"])
        """
        try:
            if not self.client or not keys:
                return {}

            values = await self.client.mget(keys)
            result = {}

            for key, value in zip(keys, values):
                if value is not None:
                    try:
                        result[key] = json.loads(value)
                    except json.JSONDecodeError:
                        logger.error(f"Failed to deserialize value for key {key}")

            return result

        except Exception as e:
            logger.error(f"Bulk get error: {e}")
            return {}

    async def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern

        Args:
            pattern: Redis pattern (e.g., "opener:user:123:*")

        Returns:
            int: Number of keys deleted

        Example:
            >>> count = await cache.delete_pattern("opener:user:123:*")
        """
        try:
            if not self.client:
                return 0

            # Find matching keys
            keys = []
            async for key in self.client.scan_iter(match=pattern):
                keys.append(key)

            # Delete in batch
            if keys:
                deleted = await self.client.delete(*keys)
                logger.info(f"Deleted {deleted} keys matching pattern: {pattern}")
                return deleted

            return 0

        except Exception as e:
            logger.error(f"Delete pattern error for {pattern}: {e}")
            return 0

    # ==================== Cache Key Generators ====================

    @staticmethod
    def make_opener_key(bio_hash: str, cultural_style: str, tone: str) -> str:
        """Generate cache key for conversation openers"""
        return f"opener:{cultural_style}:{tone}:{bio_hash}"

    @staticmethod
    def make_response_key(message_hash: str, cultural_style: str, context_hash: str) -> str:
        """Generate cache key for conversation responses"""
        return f"response:{cultural_style}:{message_hash}:{context_hash}"

    @staticmethod
    def make_rate_limit_key(user_id: int) -> str:
        """Generate rate limit key for user"""
        return f"rate:user:{user_id}"

    @staticmethod
    def make_safety_key(text_hash: str) -> str:
        """Generate cache key for safety checks"""
        return f"safety:{text_hash}"


# ==================== Global Redis Instance ====================

# Global instance (initialized in FastAPI lifespan)
redis_client = RedisClient()


async def get_redis() -> RedisClient:
    """
    Dependency for getting Redis client in FastAPI endpoints

    Usage:
        @router.get("/cached")
        async def cached_endpoint(cache: RedisClient = Depends(get_redis)):
            value = await cache.get("key")
    """
    if not redis_client.connected:
        await redis_client.connect()
    return redis_client


def get_redis_client() -> RedisClient:
    """
    Get the global Redis client instance (for startup/shutdown events)

    Usage:
        redis = get_redis_client()
        await redis.connect()
    """
    return redis_client
