"""
Pearson-related constants
"""

# Pearson TSV constants
PEARSON_CSV_DIALECT = 'pearsontsv'

PEARSON_DATE_FORMAT = "%Y/%m/%d"
PEARSON_DATETIME_FORMAT = "%Y/%m/%d %H:%M:%S"

# SFTP Upload constants
PEARSON_UPLOAD_REQUIRED_SETTINGS = [
    "EXAMS_SFTP_HOST",
    "EXAMS_SFTP_PORT",
    "EXAMS_SFTP_USERNAME",
    "EXAMS_SFTP_PASSWORD",
    "EXAMS_SFTP_UPLOAD_DIR",
]
