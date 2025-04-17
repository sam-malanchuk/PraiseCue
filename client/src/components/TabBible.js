import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  Heading,
  useColorModeValue
} from '@chakra-ui/react';

const dummyBooks = {
  'John': {
    3: ['16', '17', '18'],
    4: ['1', '2']
  },
  'Romans': {
    8: ['28', '29'],
    10: ['9', '10', '11']
  }
};

function TabBible({ socket, activeContent }) {
  const [selectedVersion, setSelectedVersion] = useState('KJV');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState('');

  const activeRef = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
  const isActive = activeContent?.contentType === 'bible' && activeContent?.stanzaOrVerse === activeRef;

  const handleClickVerse = () => {
    if (isActive) {
      socket.emit('clearContent');
      return;
    }

    socket.emit('showContent', {
      contentType: 'bible',
      contentId: 1,
      stanzaOrVerse: activeRef
    });
  };

  const reset = (level) => {
    if (level === 'book') {
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedVerse('');
    } else if (level === 'chapter') {
      setSelectedChapter('');
      setSelectedVerse('');
    } else if (level === 'verse') {
      setSelectedVerse('');
    }
  };

  return (
    <Box mt={4}>
      <Heading size="sm" mb={2}>Bible Version</Heading>
      <Flex gap={2} mb={4}>
        {['KJV', 'NIV'].map((v) => (
          <Button
            key={v}
            variant={selectedVersion === v ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
            onClick={() => setSelectedVersion(v)}
          >
            {v}
          </Button>
        ))}
      </Flex>

      <Flex gap={6} align="flex-start">
        {/* Book list */}
        <Box w="30%" maxH="45vh" overflowY="auto">
          <Heading size="sm" mb={2}>Books</Heading>
          <VStack align="stretch" spacing={1}>
            {Object.keys(dummyBooks).map((book) => (
              <Button
                key={book}
                size="sm"
                variant={selectedBook === book ? 'solid' : 'outline'}
                colorScheme="teal"
                onClick={() => {
                  setSelectedBook(book);
                  reset('chapter');
                }}
              >
                {book}
              </Button>
            ))}
          </VStack>
        </Box>

        {/* Chapter list */}
        {selectedBook && (
          <Box w="30%" maxH="45vh" overflowY="auto">
            <Heading size="sm" mb={2}>Chapters</Heading>
            <VStack align="stretch" spacing={1}>
              {Object.keys(dummyBooks[selectedBook]).map((chapter) => (
                <Button
                  key={chapter}
                  size="sm"
                  variant={selectedChapter === chapter ? 'solid' : 'outline'}
                  colorScheme="purple"
                  onClick={() => {
                    setSelectedChapter(chapter);
                    reset('verse');
                  }}
                >
                  {chapter}
                </Button>
              ))}
            </VStack>
          </Box>
        )}

        {/* Verse list */}
        {selectedChapter && (
          <Box w="30%" maxH="45vh" overflowY="auto">
            <Heading size="sm" mb={2}>Verses</Heading>
            <VStack align="stretch" spacing={1}>
              {dummyBooks[selectedBook][selectedChapter].map((verse) => {
                const ref = `${selectedBook} ${selectedChapter}:${verse}`;
                const isCurrent = activeContent?.stanzaOrVerse === ref;
                return (
                  <Button
                    key={verse}
                    size="sm"
                    variant={selectedVerse === verse ? 'solid' : 'outline'}
                    colorScheme={isCurrent ? 'red' : 'blue'}
                    onClick={() => {
                      setSelectedVerse(verse);
                      handleClickVerse();
                    }}
                  >
                    {verse}
                  </Button>
                );
              })}
            </VStack>
          </Box>
        )}
      </Flex>

      {selectedVerse && (
        <Text mt={4} fontSize="sm">
          {isActive ? 'Verse shown — click again to clear' : 'Click verse to show'}
        </Text>
      )}
    </Box>
  );
}

export default TabBible;
