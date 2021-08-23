import React from 'react';
import { ChakraProvider, Center } from '@chakra-ui/react';
import Counter from './counter/counter.component';

const App: React.FunctionComponent = () => {
  return (
    <ChakraProvider>
      <Center h="100vh" w="100vw">
        <Counter />
      </Center>
    </ChakraProvider>
  );
};

export default App;
