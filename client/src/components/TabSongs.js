import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  Button,
  Heading
} from '@chakra-ui/react';

function TabSongs({ socket, activeContent }) {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedStanzaTitle, setSelectedStanzaTitle] = useState('');

  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then(setSongs)
      .catch(() => setSongs([]));
  }, []);

  const loadSong = async (id) => {
    const song = await fetch(`/api/songs/${id}`).then((res) => res.json());
    song.stanzas = JSON.parse(song.content);
    setSelectedSong(song);
    setSelectedStanzaTitle('');
  };

  const handleStanzaClick = (title) => {
    const displayText = `${selectedSong.title} - ${title}`;
    const isAlreadyActive =
      activeContent?.contentType === 'song' &&
      activeContent?.stanzaOrVerse === displayText;

    if (isAlreadyActive) {
      socket.emit('clearContent');
      setSelectedStanzaTitle('');
    } else {
      socket.emit('showContent', {
        contentType: 'song',
        contentId: selectedSong.id,
        stanzaOrVerse: displayText
      });
      setSelectedStanzaTitle(title);
    }
  };

  return (
    <Flex gap={6} mt={4}>
      <Box w="40%" maxH="60vh" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
        <Heading size="sm" mb={3}>Songs</Heading>
        <VStack align="stretch" spacing={2}>
          {songs.map((song) => (
            <Button
              key={song.id}
              variant={selectedSong?.id === song.id ? 'solid' : 'outline'}
              colorScheme="teal"
              size="sm"
              onClick={() => loadSong(song.id)}
            >
              {song.title}
            </Button>
          ))}
        </VStack>
      </Box>

      <Box w="60%" maxH="60vh" overflowY="auto" borderWidth="1px" borderRadius="md" p={3}>
        <Heading size="sm" mb={3}>
          {selectedSong ? `Stanzas in ${selectedSong.title}` : 'Select a song'}
        </Heading>
        {selectedSong?.stanzas?.length ? (
          <VStack align="stretch" spacing={2}>
            {selectedSong.stanzas.map((s, idx) => {
              const displayText = `${selectedSong.title} - ${s.title}`;
              const isActive = activeContent?.stanzaOrVerse === displayText;
              return (
                <Box
                  key={idx}
                  p={3}
                  borderRadius="md"
                  bg={isActive ? 'teal.100' : 'gray.50'}
                  _hover={{ bg: 'teal.50' }}
                  cursor="pointer"
                  onClick={() => handleStanzaClick(s.title)}
                >
                  <Text fontWeight="medium">{s.title}</Text>
                  <Text fontSize="sm" color="gray.600">{s.lines?.[0]}</Text>
                </Box>
              );
            })}
          </VStack>
        ) : (
          <Text fontSize="sm" color="gray.500">No stanzas available.</Text>
        )}
      </Box>
    </Flex>
  );
}

export default TabSongs;
