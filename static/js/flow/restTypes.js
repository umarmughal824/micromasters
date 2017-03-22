// @flow

export type RestState = {
  data?: any,
  error?: any,
  processing: boolean,
  loaded: boolean,
  fetchStatus?: string,
};

export type Endpoint = {
  name: string,
  url: string,
  makeOptions: (...args: any) => Object,
  extraActions?: Object,
  getPrefix?: string,
  postPrefix?: string,
  getFunc?: Function,
  postFunc?: Function,
  verbs: Array<string>,
};
