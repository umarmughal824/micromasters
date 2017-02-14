"""ui utilities"""
from enum import (
    Enum,
    unique,
)


# Python 3.6: this should be upgraded to enum.Flag
@unique
class FeatureFlag(Enum):
    """
    FeatureFlag enum

    Members should have values of increasing powers of 2 (1, 2, 4, 8, ...)

    """
    EXAMS = 1
