import React from 'react';
import { ChakraProvider, Flex, Box } from '@chakra-ui/react';
import Counter1 from './counter/counter1.component';
import Counter2 from './counter/counter2.component';

const test: number[] = [];

for (let i = 0; i < 100; i += 1) {
  test.push(i);
}

const App: React.FunctionComponent = () => {
  return (
    <ChakraProvider>
      <Flex h="100vh" w="100vw" justifyContent="center" alignItems="center" flexWrap="wrap">
        {test.map((elem) => (
          <Box key={elem}>
            <Flex flexDir="column">
              <Flex w="75%">
                <Counter1 />
                <Counter2 />
              </Flex>
              <Flex w="75%">
                <Counter1 />
                <Counter2 />
              </Flex>
            </Flex>
          </Box>
        ))}
      </Flex>
    </ChakraProvider>
  );
};

export default App;
