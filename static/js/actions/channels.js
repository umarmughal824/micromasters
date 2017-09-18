// @flow
import { createAction } from "redux-actions"

import type { Dispatch } from "redux"
import type { Dispatcher } from "../flow/reduxTypes"
import type { CreateChannelResponse } from "../flow/discussionTypes"

export const qualifiedName = (name: string) => `CHANNEL_DIALOG_${name}`

export const START_CHANNEL_EDIT = qualifiedName("START_CHANNEL_EDIT")
export const startChannelEdit = createAction(START_CHANNEL_EDIT)

export const UPDATE_CHANNEL_EDIT = qualifiedName("UPDATE_CHANNEL_EDIT")
export const updateChannelEdit = createAction(UPDATE_CHANNEL_EDIT)

export const CLEAR_CHANNEL_EDIT = qualifiedName("CLEAR_CHANNEL_EDIT")
export const clearChannelEdit = createAction(CLEAR_CHANNEL_EDIT)

export const INITIATE_CREATE_CHANNEL = qualifiedName("INITIATE_CREATE_CHANNEL")
export const initiateCreateChannel = createAction(INITIATE_CREATE_CHANNEL)

export const CREATE_CHANNEL_SUCCESS = qualifiedName("CREATE_CHANNEL_SUCCESS")
export const createChannelSuccess = createAction(CREATE_CHANNEL_SUCCESS)

export const CREATE_CHANNEL_FAILURE = qualifiedName("CREATE_CHANNEL_FAILURE")
export const createChannelFailure = createAction(CREATE_CHANNEL_FAILURE)

export function createChannel(
  createFunc: () => Promise<CreateChannelResponse>,
  createFunctionParams: Array<*>
): Dispatcher<*> {
  return (dispatch: Dispatch) => {
    dispatch(initiateCreateChannel())
    return createFunc(...createFunctionParams).then(
      response => {
        dispatch(createChannelSuccess())
        return Promise.resolve(response)
      },
      error => {
        dispatch(createChannelFailure({ error: error }))
        return Promise.reject(error)
      }
    )
  }
}
