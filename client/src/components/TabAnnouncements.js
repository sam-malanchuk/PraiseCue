import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Heading
} from '@chakra-ui/react';

function TabAnnouncements({ socket, activeContent }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]));
  }, []);

  const handleClick = (a) => {
    const displayText = `${a.title}: ${a.body}`;
    const isActive =
      activeContent?.contentType === 'announcement' &&
      activeContent?.stanzaOrVerse === displayText;

    if (isActive) {
      socket.emit('clearContent');
    } else {
      socket.emit('showContent', {
        contentType: 'announcement',
        contentId: a.id,
        stanzaOrVerse: displayText
      });
    }
  };

  return (
    <Box mt={4}>
      <Heading size="sm" mb={3}>Announcements</Heading>
      <VStack spacing={3} align="stretch" maxH="60vh" overflowY="auto">
        {announcements.map((a) => {
          const displayText = `${a.title}: ${a.body}`;
          const isActive =
            activeContent?.contentType === 'announcement' &&
            activeContent?.stanzaOrVerse === displayText;

          return (
            <Box
              key={a.id}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              bg={isActive ? 'orange.100' : 'gray.50'}
              _hover={{ bg: 'gray.100' }}
              cursor="pointer"
              onClick={() => handleClick(a)}
            >
              <Text fontWeight="bold">{a.title}</Text>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                {a.body}
              </Text>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}

export default TabAnnouncements;
