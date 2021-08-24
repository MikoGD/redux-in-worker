import React from 'react';
import { Flex, Button, Heading, Center, Text, Spinner } from '@chakra-ui/react';
import { dispatch } from './managers/worker.manager';
import { useSelector } from './managers/hooks';

export const Counter: React.FC = () => {
  const { counter, isLoading } = useSelector((state) => state.counter);
  console.log(`counter: ${counter}`);

  const incrementCounter = () => {
    dispatch({ type: 'counter/increment' });
  };

  const decrementCounter = () => {
    dispatch({ type: 'counter/decrement' });
  };

  const multiplyCounter = () => {
    dispatch({ type: 'counter/multiply', payload: 2 });
  };

  return (
    <Flex flexDir="column">
      <Center my="5">
        <Heading>{isLoading ? <Spinner /> : <Text>{`Counter: ${counter}`}</Text>}</Heading>
      </Center>
      <Flex justifyContent="space-between" w="35rem">
        <Button type="button" onClick={incrementCounter} bgColor="gray.300">
          Increment
        </Button>
        <Button type="button" onClick={decrementCounter} bgColor="gray.300">
          Decrement
        </Button>
        <Button type="button" onClick={() => multiplyCounter()} bgColor="gray.300">
          Multiply
        </Button>
      </Flex>
    </Flex>
  );
};

export default Counter;
