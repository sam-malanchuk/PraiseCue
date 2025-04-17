import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

function TabAnnouncements() {
  const { socket, activeContent, activeDisplayId } = useAppContext();
  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements on mount
  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(setAnnouncements)
      .catch(console.error);
  }, []);

  const handleShowAnnouncement = (ann) => {
    if (
      activeContent?.contentType === 'announcement' &&
      activeContent.contentId === ann.id &&
      activeContent.stanzaOrVerse === ann.body
    ) {
      socket.emit('clearContent');
    } else {
      socket.emit('showContent', {
        contentType: 'announcement',
        contentId: ann.id,
        stanzaOrVerse: ann.body,
        targetDisplays: [activeDisplayId]
      });
    }
  };

  return (
    <Box>
      <Heading size="md" mb={4}>Announcements</Heading>
      <VStack spacing={2} align="stretch">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <Box
              key={ann.id}
              p={3}
              borderRadius="md"
              bg={
                activeContent?.contentType === 'announcement' &&
                activeContent.contentId === ann.id &&
                activeContent.stanzaOrVerse === ann.body
                  ? 'teal.100'
                  : 'gray.50'
              }
              cursor="pointer"
              onClick={() => handleShowAnnouncement(ann)}
            >
              <Text fontWeight="bold">{ann.title}</Text>
              <Text fontSize="sm" color="gray.600" noOfLines={2}>{ann.body}</Text>
            </Box>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">No announcements available.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default TabAnnouncements;
