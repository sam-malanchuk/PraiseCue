import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Text, VStack, Heading } from '@chakra-ui/react';
import { io } from 'socket.io-client';

function Display() {
  const { id } = useParams();
  const displayId = parseInt(id, 10);
  const [mode, setMode] = useState('solo');
  const [groupId, setGroupId] = useState(null);
  const [content, setContent] = useState(null);
  const [stanzaLines, setStanzaLines] = useState([]);

  // Initialize socket
  const [socket] = useState(() => io(`http://${window.location.hostname}:3001`));

  useEffect(() => {
    // Store in case we need it later
    localStorage.setItem('displayId', displayId);

    // Fetch display metadata (mode and group)
    fetch(`/api/displays/${displayId}`)
      .then((res) => res.json())
      .then((data) => {
        setMode(data.mode || 'solo');
        setGroupId(data.groupId || null);
        // Register on server for this display
        socket.emit('registerDisplay', {
          displayNumber: displayId,
          mode: data.mode,
          groupId: data.groupId,
        });
      })
      .catch(console.error);

    // Listen for content updates
    socket.on('contentUpdate', (data) => {
      const { contentType, contentId, stanzaOrVerse, targetDisplays = [], targetGroup } = data;
      const isSoloTarget = mode === 'solo' && targetDisplays.includes(displayId);
      const isGroupTarget = mode === 'follow' && targetGroup === groupId;
      if (!isSoloTarget && !isGroupTarget) return;

      setContent({ contentType, contentId, stanzaOrVerse });

      if (contentType === 'song') {
        fetch(`/api/songs/${contentId}`)
          .then((res) => res.json())
          .then((song) => {
            setStanzaLines(song.content || []);
          })
          .catch(console.error);
      }

      if (contentType === 'bible') {
        fetch(`/api/bible/${contentId}`)
          .then((res) => res.json())
          .then((verse) => setStanzaLines([verse.text]))
          .catch(console.error);
      }
    });

    // Listen for clear signal
    socket.on('contentClear', () => {
      setContent(null);
      setStanzaLines([]);
    });

    return () => {
      socket.off('contentUpdate');
      socket.off('contentClear');
      socket.disconnect();
    };
  }, [socket, displayId, mode, groupId]);

  return (
    <Box p={4} textAlign="center">
      <Heading mb={4}>Display {displayId}</Heading>

      {!content && <Text fontSize="lg">No content</Text>}

      {content?.contentType === 'bible' && (
        <VStack spacing={4}>
          <Text fontSize="2xl">{content.stanzaOrVerse}</Text>
          {stanzaLines.map((line, idx) => (
            <Text key={idx}>{line}</Text>
          ))}
        </VStack>
      )}

      {content?.contentType === 'song' && (
        <VStack spacing={4}>
          <Text fontSize="2xl">{content.stanzaOrVerse}</Text>
          {stanzaLines.map((line, idx) => (
            <Text key={idx}>{line}</Text>
          ))}
        </VStack>
      )}

      {content?.contentType === 'announcement' && (
        <VStack spacing={4}>
          <Text fontSize="2xl">Announcement</Text>
          <Text>{content.stanzaOrVerse}</Text>
        </VStack>
      )}
    </Box>
  );
}

export default Display;
