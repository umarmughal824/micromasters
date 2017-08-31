"""Test for discussions tasks"""

from discussions import tasks
from discussions.exceptions import DiscussionUserSyncException


def test_sync_disabled(settings, mocker):
    """Test that sync_discussion_user doesn't call the api if disabled"""
    settings.FEATURES['OPEN_DISCUSSIONS_USER_SYNC'] = False
    mock_api = mocker.patch('discussions.api.create_or_update_discussion_user')
    tasks.sync_discussion_user('profile_id')
    assert mock_api.called is False


def test_sync_enabled(settings, mocker):
    """Test that sync_discussion_user call the api if enabled"""
    settings.FEATURES['OPEN_DISCUSSIONS_USER_SYNC'] = True
    mock_api = mocker.patch('discussions.api.create_or_update_discussion_user')
    tasks.sync_discussion_user('profile_id')
    mock_api.assert_called_once_with('profile_id')


def test_task_api_error(settings, mocker):
    """Test that sync_discussion_user logs errors if they occur"""
    settings.FEATURES['OPEN_DISCUSSIONS_USER_SYNC'] = True
    mock_log = mocker.patch('discussions.tasks.log')
    mock_api = mocker.patch('discussions.api.create_or_update_discussion_user')
    mock_api.side_effect = DiscussionUserSyncException()
    tasks.sync_discussion_user('profile_id')
    mock_api.assert_called_once_with('profile_id')
    mock_log.exception.assert_called_once_with("Error syncing user profile")
