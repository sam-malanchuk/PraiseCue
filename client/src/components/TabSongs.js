import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

function TabSongs() {
  const { socket, activeContent, activeDisplayId } = useAppContext();
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch song summaries on mount
  useEffect(() => {
    fetch('/api/songs')
      .then((res) => res.json())
      .then(setSongs)
      .catch(console.error);
  }, []);

  // Load full song details when a song is selected
  const handleSelectSong = async (song) => {
    try {
      const res = await fetch(`/api/songs/${song.id}`);
      if (!res.ok) throw new Error('Failed to fetch song');
      const fullSong = await res.json();
      setSelectedSong(fullSong);
    } catch (err) {
      console.error(err);
    }
  };

  // Show or clear stanza on click
  const handleShowStanza = (stanza) => {
    if (
      activeContent?.contentType === 'song' &&
      activeContent.contentId === selectedSong.id &&
      activeContent.stanzaOrVerse === stanza.title
    ) {
      socket.emit('clearContent');
    } else {
      socket.emit('showContent', {
        contentType: 'song',
        contentId: selectedSong.id,
        stanzaOrVerse: stanza.title,
        targetDisplays: [activeDisplayId],
      });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Songs</Heading>

      {/* Song list */}
      <VStack spacing={2} align="stretch">
        {songs.map((song) => (
          <Box
            key={song.id}
            p={3}
            borderRadius="md"
            bg={selectedSong?.id === song.id ? 'teal.50' : 'gray.50'}
            cursor="pointer"
            onClick={() => handleSelectSong(song)}
          >
            <Text fontWeight="bold">{song.title}</Text>
            {song.tags && <Text fontSize="sm" color="gray.600">{song.tags.join(', ')}</Text>}
          </Box>
        ))}
      </VStack>

      {/* Stanza list */}
      {selectedSong?.content?.length > 0 && (
        <Box mt={6}>
          <Heading size="sm" mb={3}>{selectedSong.title} - Stanzas</Heading>
          <VStack spacing={2} align="stretch">
            {selectedSong.content.map((stanza) => (
              <Box
                key={stanza.title}
                p={2}
                borderRadius="md"
                bg={
                  activeContent?.contentType === 'song' &&
                    activeContent.contentId === selectedSong.id &&
                    activeContent.stanzaOrVerse === stanza.title
                    ? 'teal.100'
                    : 'gray.50'
                }
                cursor="pointer"
                onClick={() => handleShowStanza(stanza)}
              >
                <Text fontWeight="medium">{stanza.title}</Text>
                <Text fontSize="sm" color="gray.600">{stanza.lines[0]}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default TabSongs;
