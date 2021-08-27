import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { REDUX_MESSAGE_TYPE, RootState } from '../redux-worker/types';
import { addOnMessage, addSubscription, removeOnMessage, removeSubscription, selector } from './worker.manager';

interface SelectorState<T> {
  isLoading: boolean;
  state: T | undefined;
}

/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
export const useSelector = <T>(sliceFn: (state: RootState) => T, initialState: T): any => {
  // /* eslint-enable no-unused-vars */
  const [state, setState] = useState<SelectorState<T>>({ isLoading: true, state: initialState });

  useEffect(() => {
    const id = uuid();

    addSubscription(id, sliceFn);

    addOnMessage((messageEvent: MessageEvent) => {
      const { type, state: newState } = messageEvent.data;

      if (type === REDUX_MESSAGE_TYPE.UPDATE) {
        setState({ state: newState, isLoading: false });
      }
    }, id);

    return () => {
      removeSubscription(id);
      removeOnMessage(id);
    };
  }, []);

  useEffect(() => {
    selector<T>(sliceFn).then((data) => {
      setState({ state: data, isLoading: false });
    });
  }, []);

  return { counter: state.state, isLoading: state.isLoading };
};
