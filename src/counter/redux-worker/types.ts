import { Action } from 'redux';

// eslint-disable-next-line
export type OnMessage<T extends MessageEvent> = (messageEvent: T) => void;

// eslint-disable-next-line
export type SliceFn = (state: any) => any;

export interface CounterState {
  [counter: string]: number;
}

export interface RootState {
  [counterReducer1: string]: CounterState;
  counterReducer2: CounterState;
}

export interface CounterAction<T extends unknown, K extends unknown> extends Action<T> {
  type: T;
  payload?: K;
}

export enum REDUX_MESSAGE_TYPE {
  DISPATCH = 'dispatch',
  SELECT = 'select',
  ADD_SUB = 'addSub',
  REMOVE_SUB = 'removeSub',
  UPDATE = 'update',
}

export enum ONMESSAGE_TYPE {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}
