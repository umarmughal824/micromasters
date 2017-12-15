// @flow
import R from "ramda"

import {
  START_CHANNEL_EDIT,
  UPDATE_CHANNEL_EDIT,
  CLEAR_CHANNEL_EDIT,
  INITIATE_CREATE_CHANNEL,
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_FAILURE
} from "../actions/channels"
import { discussionErrors } from "../lib/validation/discussions"
import { FETCH_FAILURE, FETCH_SUCCESS, FETCH_PROCESSING } from "../actions"

import type { Action } from "../flow/reduxTypes"
import type { ChannelInputs, ChannelState } from "../flow/discussionTypes"

export const NEW_CHANNEL_EDIT: ChannelInputs = {
  name:         "",
  title:        "",
  description:  "",
  channel_type: "private"
}

export const INITIAL_CHANNEL_STATE: ChannelState = {
  inputs:               { ...NEW_CHANNEL_EDIT },
  validationErrors:     {},
  validationVisibility: {},
  saveError:            {},
  filters:              [],
  searchkit:            {},
  fetchStatus:          ""
}

export const channelDialog = (
  state: ChannelState = INITIAL_CHANNEL_STATE,
  action: Action<any, null>
) => {
  switch (action.type) {
  case START_CHANNEL_EDIT: {
    const startInputs = {
      ...NEW_CHANNEL_EDIT,
      ...action.payload.inputs
    }
    const newState = {
      ...state,
      filters:          R.propOr([], "filters", action.payload),
      inputs:           startInputs,
      validationErrors: discussionErrors(startInputs),
      searchkit:        action.payload.searchkit || {}
    }
    return newState
  }
  case UPDATE_CHANNEL_EDIT: {
    const updatedInputs = {
      ...state.inputs,
      ...action.payload.inputs
    }
    return {
      ...state,
      inputs:               updatedInputs,
      validationErrors:     discussionErrors(updatedInputs),
      validationVisibility: {
        ...state.validationVisibility,
        ...action.payload.validationVisibility
      }
    }
  }
  case CLEAR_CHANNEL_EDIT:
    return R.clone(INITIAL_CHANNEL_STATE)

  case INITIATE_CREATE_CHANNEL:
    return {
      ...state,
      fetchStatus: FETCH_PROCESSING
    }
  case CREATE_CHANNEL_SUCCESS:
    return {
      ...state,
      fetchStatus: FETCH_SUCCESS
    }
  case CREATE_CHANNEL_FAILURE:
    return {
      ...state,
      fetchStatus: FETCH_FAILURE,
      sendError:   action.payload.error
    }

  default:
    return state
  }
}
