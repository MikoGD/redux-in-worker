import _ from 'lodash';
import { createStore, combineReducers } from 'redux';
import { SliceFn, REDUX_MESSAGE_TYPE, ONMESSAGE_TYPE, CounterAction } from './types';

const counter1InitialState = {
  counter: 0,
};

const counter2InitialState = {
  counter: 0,
};

interface Subscription {
  sliceFn: SliceFn;
  sliceState: unknown;
}

const subscriptions = new Map<string, Subscription>();
const sameSubscriptions = new Map<string, Subscription[]>();

const counterReducer1 = (state = counter1InitialState, action: CounterAction<string, number>) => {
  switch (action.type) {
    case 'counter1/increment':
      return { counter: state.counter + 1 };
    case 'counter1/decrement':
      return { counter: state.counter - 1 };
    case 'counter1/multiply':
      return { counter: state.counter * (action.payload ?? 1) };
    default:
      return state;
  }
};

const counterReducer2 = (state = counter2InitialState, action: CounterAction<string, number>) => {
  switch (action.type) {
    case 'counter2/increment':
      return { counter: state.counter + 1 };
    case 'counter2/decrement':
      return { counter: state.counter - 1 };
    case 'counter2/multiply':
      return { counter: state.counter * (action.payload ?? 1) };
    default:
      return state;
  }
};

const rootReducer = combineReducers({ counterReducer1, counterReducer2 });

const store = createStore(rootReducer);

store.subscribe(() => {
  const start = performance.now();
  subscriptions.forEach(({ sliceFn, sliceState }, id) => {
    const currStoreState = store.getState();
    const newSliceState = sliceFn(currStoreState);
    const isEqual = _.isEqual(newSliceState, sliceState);

    if (!isEqual) {
      subscriptions.set(id, { sliceFn, sliceState: newSliceState });

      postMessage({
        onmessageType: ONMESSAGE_TYPE.EXTERNAL,
        type: REDUX_MESSAGE_TYPE.UPDATE,
        id,
        state: newSliceState,
      });
    }
  });

  console.log(`Time taken to update all slices: ${performance.now() - start}`);
});

const addSubscription = (event: MessageEvent): void => {
  const { subscriptionId, sliceFnString } = event.data;
  /* eslint-disable no-eval */
  const sliceFn = eval(sliceFnString);
  /* eslint-enable no-eval */
  const sliceState = sliceFn(store.getState());
  subscriptions.set(subscriptionId, { sliceFn, sliceState });
};

const removeSubscription = (event: MessageEvent): void => {
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
  const state = cb(store.getState());
  /* eslint-enable no-eval */

  postMessage({
    onmessageType: ONMESSAGE_TYPE.INTERNAL,
    type: REDUX_MESSAGE_TYPE.SELECT,
    selectId,
    state,
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
