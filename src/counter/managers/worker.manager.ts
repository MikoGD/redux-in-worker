import { v4 as uuid } from 'uuid';
/* eslint-disable */
// @ts-ignore
import ReduxWorker from 'worker-loader!../redux-worker/redux.worker';
/* eslint-enable */
import {
  RootState,
  CounterAction,
  OnMessage,
  SliceFn,
  REDUX_MESSAGE_TYPE,
  ONMESSAGE_TYPE,
} from '../redux-worker/types';

type Resolve<T extends unknown> = (value: T) => void;

/* eslint-disable import/prefer-default-export */
const worker: Worker = new ReduxWorker();
const onMessageMap = new Map<string, OnMessage<any>>();
const selectPromises = new Map<string, Resolve<any>>();

export const dispatch = <T extends unknown, K extends unknown>(action: CounterAction<T, K>): void => {
  worker.postMessage({ type: REDUX_MESSAGE_TYPE.DISPATCH, action });
};

export const selector = async <T extends unknown>(sliceFn: (state: RootState) => any): Promise<T> => {
  const id = uuid();
  const state = await new Promise<T>((resolve) => {
    worker.postMessage({ type: REDUX_MESSAGE_TYPE.SELECT, selectId: id, sliceFnString: String(sliceFn) });

    selectPromises.set(id, resolve);
  });

  selectPromises.delete(id);

  return state;
};

/* eslint-disable no-unused-vars */
export const addOnMessage = (onMessage: (messageEvent: MessageEvent) => void, id: string): void => {
  /* eslint-enable no-unused-vars */
  onMessageMap.set(id, onMessage);
};

export const removeOnMessage = (id: string): boolean => onMessageMap.delete(id);

const sameSubscriptions = new Map<string, string[]>();
const sliceFnToSameSubMap = new Map<string, string>();

export const addSubscription = (id: string, sliceFn: SliceFn): void => {
  const sliceFnString = String(sliceFn);
  const sameSubId = sliceFnToSameSubMap.get(sliceFnString);

  if (sameSubId) {
    const subsArr = sameSubscriptions.get(sameSubId);

    if (subsArr) {
      subsArr.push(id);
      sameSubscriptions.set(sameSubId, subsArr);
    }
  } else {
    const newSameSubId = uuid();
    const newSubsArr = [id];
    sliceFnToSameSubMap.set(sliceFnString, newSameSubId);
    sameSubscriptions.set(newSameSubId, newSubsArr);
    worker.postMessage({ type: REDUX_MESSAGE_TYPE.ADD_SUB, subscriptionId: newSameSubId, sliceFnString });
  }
};

export const removeSubscription = (id: string): void => {
  worker.postMessage({ type: REDUX_MESSAGE_TYPE.ADD_SUB, subscriptionId: id });
};

const handleSelectMessage = (event: MessageEvent) => {
  const { selectId, state } = event.data;

  const resolve = selectPromises.get(selectId);

  if (resolve) {
    resolve(state);
  }
};

const handleExternalMessage = async (event: MessageEvent) => {
  const { id } = event.data;
  const sameSubsArr = sameSubscriptions.get(id);
  const promises: Promise<any>[] = [];

  sameSubsArr?.forEach((subId) => {
    promises.push(
      new Promise((resolve) => {
        const currOnMessage = onMessageMap.get(subId);

        if (currOnMessage) {
          currOnMessage(event);
        }
        resolve('done');
      })
    );
  });

  Promise.all(promises);
};

const handleInternalOnMessage = (event: MessageEvent) => {
  const { type } = event.data;
  switch (type) {
    case REDUX_MESSAGE_TYPE.SELECT:
      handleSelectMessage(event);
      break;
    default:
      console.error('unhandled message type for manager internal onmessage', type);
  }
};

worker.onmessage = (event: MessageEvent) => {
  const { onmessageType } = event.data;

  switch (onmessageType) {
    case ONMESSAGE_TYPE.INTERNAL:
      handleInternalOnMessage(event);
      break;
    case ONMESSAGE_TYPE.EXTERNAL:
      handleExternalMessage(event);
      break;
    default:
      console.error('unhandled onmessage type for manager: ', onmessageType);
  }
};
