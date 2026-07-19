"""
Test-suite-wide fixtures and compatibility shims.

Compatibility note: newer Beanie versions (2.x) call
`database.list_collection_names(authorizedCollections=True, nameOnly=True)` during
init_beanie's startup, using kwargs that real MongoDB (via Motor) supports fine.
mongomock's synchronous Database.list_collection_names() doesn't accept those
kwargs yet, which mongomock-motor just proxies straight through -- so it blows up
with a TypeError in tests only, never in production (which talks to a real Mongo
via Motor, not mongomock). This shim makes the mock accept and ignore those
extra kwargs so our fully in-memory test database keeps working across Beanie
upgrades. Safe to delete once mongomock/mongomock-motor ship a fix upstream.
"""

import mongomock.database

_original_list_collection_names = mongomock.database.Database.list_collection_names


def _compatible_list_collection_names(self, filter=None, session=None, **_ignored_kwargs):
    return _original_list_collection_names(self, filter=filter, session=session)


mongomock.database.Database.list_collection_names = _compatible_list_collection_names
