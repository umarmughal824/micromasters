/* global SETTINGS:false, fetch: false */
// For mocking purposes we need to use 'fetch' defined as a global instead of importing as a local.
import 'isomorphic-fetch';
import _ from 'lodash';

import { DASHBOARD_RESPONSE } from '../constants';

function getCookie(name) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== '') {
    let cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();

      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

/**
 * Calls to fetch but does a few other things:
 *  - turn cookies on for this domain
 *  - set headers to handle JSON properly
 *  - handle CSRF
 *  - non 2xx status codes will reject the promise returned
 *  - response JSON is returned in place of response
 *
 * @param {string} input URL of fetch
 * @param {Object} init Settings to pass to fetch
 * @returns {Promise} The promise with JSON of the response
 */
function fetchJSONWithCSRF(input, init) {
  if (init === undefined) {
    init = {};
  }
  init.headers = init.headers || {};
  _.defaults(init.headers, {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  let method = init.method || 'GET';

  if (!csrfSafeMethod(method)) {
    init.headers['X-CSRFToken'] = getCookie('csrftoken');
  }
  // turn on cookies for this domain
  init.credentials = 'same-origin';

  return fetch(input, init).then(response => {
    // Not using response.json() here since it doesn't handle empty responses
    // Also note that text is a promise here, not a string
    let text = response.text();

    // For non 2xx status codes reject the promise
    if (response.status < 200 || response.status >= 300) {
      return Promise.reject(text);
    }
    return text;
  }).then(text => {
    if (text.length !== 0) {
      return JSON.parse(text);
    } else {
      return "";
    }
  });
}

export function getCourseList() {
  return fetchJSONWithCSRF('/api/v0/courses/');
}

export function getProgramList() {
  return fetchJSONWithCSRF('/api/v0/programs/');
}

export function getUserProfile(username) {
  return fetchJSONWithCSRF(`/api/v0/profiles/${username}/`);
}

export function patchUserProfile(username, profile) {
  return fetchJSONWithCSRF(`/api/v0/profiles/${username}/`, {
    method: 'PATCH',
    body: JSON.stringify(profile)
  });
}

export function getDashboard() {
  return Promise.resolve(DASHBOARD_RESPONSE);
}
