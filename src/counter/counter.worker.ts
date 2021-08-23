import { expose } from 'comlink';

const state = {
  counter: 0,
  incrementCounter() {
    this.counter += 1;
  },
  decrementCounter() {
    this.counter -= 1;
  },
};

expose(state);
