import React from 'react';
import { ChakraProvider, Center, Flex } from '@chakra-ui/react';
import Counter1 from './counter/counter1.component';
import Counter2 from './counter/counter2.component';

const App: React.FunctionComponent = () => {
  return (
    <ChakraProvider>
      <Center h="100vh" w="100vw">
        <Flex w="75%">
          <Counter1 />
          <Counter2 />
        </Flex>
      </Center>
    </ChakraProvider>
  );
};

export default App;
