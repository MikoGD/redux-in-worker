import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { REDUX_MESSAGE_TYPE, RootState } from '../redux-worker/types';
import { addOnMessage, addSubscription, removeOnMessage, removeSubscription, selector } from './worker.manager';

/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
export const useSelector = (sliceFn: (state: RootState) => any): any => {
  // /* eslint-enable no-unused-vars */
  const [state, setState] = useState<any>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [promise, setPromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    const id = uuid();

    addSubscription(id, sliceFn);

    addOnMessage((messageEvent: MessageEvent) => {
      const { type, state: newState } = messageEvent.data;

      if (type === REDUX_MESSAGE_TYPE.UPDATE) {
        setState(newState);
      }
    }, id);

    return () => {
      removeSubscription(id);
      removeOnMessage(id);
    };
  }, []);

  useEffect(() => {
    if (!state) {
      setIsLoading(true);
      setPromise(selector(sliceFn));
    }
  }, []);

  useEffect(() => {
    if (promise) {
      promise.then((data) => {
        setPromise(null);
        setIsLoading(false);
        setState(data);
      });
    }
  }, [promise]);

  return { counter: state, isLoading };
};
