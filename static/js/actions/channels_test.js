// @flow
import {
  startChannelEdit,
  updateChannelEdit,
  clearChannelEdit,
  initiateCreateChannel,
  createChannelSuccess,
  createChannelFailure,
  START_CHANNEL_EDIT,
  UPDATE_CHANNEL_EDIT,
  CLEAR_CHANNEL_EDIT,
  INITIATE_CREATE_CHANNEL,
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_FAILURE
} from "./channels"
import { assertCreatedActionHelper } from "./test_util"

describe("generated channelsEndpoint action helpers", () => {
  it("should create all action creators", () => {
    [
      [startChannelEdit, START_CHANNEL_EDIT],
      [updateChannelEdit, UPDATE_CHANNEL_EDIT],
      [clearChannelEdit, CLEAR_CHANNEL_EDIT],
      [initiateCreateChannel, INITIATE_CREATE_CHANNEL],
      [createChannelSuccess, CREATE_CHANNEL_SUCCESS],
      [createChannelFailure, CREATE_CHANNEL_FAILURE]
    ].forEach(assertCreatedActionHelper)
  })
})
