"""Utility functions for search"""


def traverse_mapping(mapping):
    """
    Traverse a mapping, yielding each node

    Args:
        mapping (dict): A dictionary within the mapping
    Returns:
        generator: A generator of dicts within the mapping
    """
    yield mapping
    for value in mapping.values():
        if isinstance(value, dict):
            yield from traverse_mapping(value)
