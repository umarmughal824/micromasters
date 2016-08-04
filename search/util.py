"""Utility functions for search"""


def traverse_mapping(mapping):
    """
    Traverse a mapping, yielding each nested dict

    Args:
        mapping (dict): The mapping itself, or a nested dict
    Returns:
        generator: A generator of dicts within the mapping
    """
    yield mapping
    for value in mapping.values():
        if isinstance(value, dict):
            yield from traverse_mapping(value)
