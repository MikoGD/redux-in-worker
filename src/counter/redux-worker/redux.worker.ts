import { createStore, Action } from 'redux';
import { RootState, SliceFn, REDUX_MESSAGE_TYPE, ONMESSAGE_TYPE, CounterAction } from './types';

const initialState: RootState = {
  counter: 0,
};

const subscriptions = new Map<string, SliceFn>();

const counterReducer = (state = initialState, action: CounterAction<string, number>) => {
  switch (action.type) {
    case 'counter/increment':
      return { counter: state.counter + 1 };
    case 'counter/decrement':
      return { counter: state.counter - 1 };
    case 'counter/multiply':
      return { counter: state.counter * (action.payload ?? 0) };
    default:
      return state;
  }
};

const store = createStore(counterReducer);

store.subscribe(() => {
  subscriptions.forEach((sliceFn, id) => {
    postMessage({
      onmessageType: ONMESSAGE_TYPE.EXTERNAL,
      type: REDUX_MESSAGE_TYPE.UPDATE,
      id,
      state: sliceFn(store.getState()),
    });
  });
});

/* eslint-disable-next-line */
export const selector = (cbString: string): any => {
  /* eslint-disable-next-line */
  const cb: (state: RootState) => any = eval(cbString);
  return cb(store.getState());
};

export const addSubscription = (event: MessageEvent): void => {
  const { subscriptionId, sliceFnString } = event.data;
  /* eslint-disable no-eval */
  subscriptions.set(subscriptionId, eval(sliceFnString));
  /* eslint-enable no-eval */
};

export const removeSubscription = (event: MessageEvent): void => {
  const { subscriptionId } = event.data;

  subscriptions.delete(subscriptionId);
};

const handleDispatchMessage = (event: MessageEvent) => {
  const { action } = event.data;

  store.dispatch(action);
};

const handleSelectMessage = (event: MessageEvent) => {
  const { selectId, sliceFnString } = event.data;

  /* eslint-disable no-eval */
  const cb = eval(sliceFnString);
  /* eslint-enable no-eval */

  postMessage({
    onmessageType: ONMESSAGE_TYPE.INTERNAL,
    type: REDUX_MESSAGE_TYPE.SELECT,
    selectId,
    state: cb(store.getState()),
  });
};

onmessage = (event: MessageEvent) => {
  const { type } = event.data;

  switch (type) {
    case REDUX_MESSAGE_TYPE.DISPATCH:
      handleDispatchMessage(event);
      break;
    case REDUX_MESSAGE_TYPE.SELECT:
      handleSelectMessage(event);
      break;
    case REDUX_MESSAGE_TYPE.ADD_SUB:
      addSubscription(event);
      break;
    case REDUX_MESSAGE_TYPE.REMOVE_SUB:
      removeSubscription(event);
      break;
    default:
      console.error('unhandled redux message type: ', type);
  }
};
