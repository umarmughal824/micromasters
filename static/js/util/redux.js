// @flow
import type {
  ActionCreator,
  AsyncActionHelper,
  AsyncActionCreator
} from '../flow/reduxTypes';
import type { Dispatch } from 'redux';

export function createActionHelper(dispatch: Dispatch, actionCreator: Function): (...args: any) => void {
  return (...args) => dispatch(actionCreator(...args));
}

/*
 * returns an array of simple (synchronous) action helpers when passed the
 * dispatch function and an array of synchronous action creators
 */
export type ActionHelpers = Array<{[k: string]: (...args: any) => void}>;
export function createSimpleActionHelpers(dispatch: Dispatch, actionList: ActionCreator[]): ActionHelpers {
  return actionList.map(actionCreator => (
    { [actionCreator.name]: createActionHelper(dispatch, actionCreator) }
  ));
}

/*
 * returns an array of async action helpers from async action creators (those
 * that return a function taking dispatch as an argument)
 */
export type AsyncActionHelpers = Array<{[k: string]: AsyncActionHelper}>;
export function createAsyncActionHelpers(dispatch: Dispatch, actionList: AsyncActionCreator[]): AsyncActionHelpers {
  return actionList.map(actionCreator => (
    { [actionCreator.name]: createActionHelper(dispatch, actionCreator) }
  ));
}
