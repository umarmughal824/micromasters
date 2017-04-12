// @flow
/* global SETTINGS: false */
import type { Dispatch } from 'redux';

import type { Dispatcher } from '../flow/reduxTypes';
import { showEnrollPayLaterSuccess } from './ui';

export const showEnrollPayLaterSuccessMessage = (courseId: string): Dispatcher<*> => {
  return (dispatch: Dispatch) => {
    dispatch(showEnrollPayLaterSuccess(courseId));
    let promise = new Promise(function(resolve) {
      window.setTimeout(function() {
        dispatch(showEnrollPayLaterSuccess(null));
        resolve();
      }, 9000);
    });
    return promise;
  };
};
