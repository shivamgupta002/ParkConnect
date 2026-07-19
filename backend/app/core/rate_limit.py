"""
Shared slowapi Limiter instance, keyed by client IP.

A single shared Limiter (rather than one per router) means rate-limit state
is consistent across the whole app and main.py only needs to register one
exception handler.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
