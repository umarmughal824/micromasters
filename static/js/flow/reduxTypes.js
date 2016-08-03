// @flow
import type { Dispatch } from 'redux';

export type Action = {
  type: string;
  payload: any
};

export type Dispatcher = (d: Dispatch) => Promise<*>;

export type AsyncActionHelper = (...a: any) => Promise<*>;

export type ActionCreator = (...a: any) => Action;

export type AsyncActionCreator = (...a: any) => Dispatcher;
