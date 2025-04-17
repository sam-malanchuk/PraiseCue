import React, { useEffect, useState } from 'react';
import { Box, Flex, VStack, Heading, Text, Select } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

function TabBible() {
  const { socket, activeContent, activeDisplayId } = useAppContext();
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedVerse, setSelectedVerse] = useState(null);

  // Load list of books
  useEffect(() => {
    fetch('/api/bible/books')
      .then(res => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  // Load chapters when book changes
  useEffect(() => {
    if (!selectedBook) return;
    fetch(`/api/bible/${selectedBook}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data);
        setSelectedChapter('');
        setVerses([]);
      })
      .catch(console.error);
  }, [selectedBook]);

  // Load verses when chapter changes
  useEffect(() => {
    if (!selectedBook || !selectedChapter) return;
    fetch(`/api/bible/${selectedBook}/${selectedChapter}`)
      .then(res => res.json())
      .then(data => {
        setVerses(data);
        setSelectedVerse(null);
      })
      .catch(console.error);
  }, [selectedChapter]);

  const handleShowVerse = (verseObj) => {
    const reference = `${selectedBook} ${selectedChapter}:${verseObj.verse}`;
    if (selectedVerse === verseObj.verse) {
      socket.emit('clearContent');
      setSelectedVerse(null);
    } else {
      setSelectedVerse(verseObj.verse);
      socket.emit('showContent', {
        contentType: 'bible',
        contentId: verseObj.id,
        stanzaOrVerse: reference,
        targetDisplays: [activeDisplayId]
      });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Bible</Heading>
      <Flex mb={4} gap={2}>
        <Select
          placeholder="Book"
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          {books.map((book) => (
            <option key={book} value={book}>{book}</option>
          ))}
        </Select>
        <Select
          placeholder="Chapter"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
        >
          {chapters.map((ch) => (
            <option key={ch} value={ch}>{ch}</option>
          ))}
        </Select>
      </Flex>

      <VStack spacing={2} align="stretch">
        {verses.map((v) => (
          <Box
            key={v.verse}
            p={3}
            bg={selectedVerse === v.verse ? 'teal.100' : 'gray.50'}
            borderRadius="md"
            cursor="pointer"
            onClick={() => handleShowVerse(v)}
          >
            <Text mb={1}>{v.text}</Text>
            <Text fontSize="sm" color="gray.500">
              {`${selectedBook} ${selectedChapter}:${v.verse}`}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default TabBible;
