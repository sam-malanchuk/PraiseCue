import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  Box,
  Button,
  ButtonGroup,
  Code,
  Flex,
  Heading,
  Stack,
  Text
} from '@chakra-ui/react';

import TabBible from '../components/TabBible';
import TabSongs from '../components/TabSongs';
import TabAnnouncements from '../components/TabAnnouncements';
import ScheduleSidebar from '../components/ScheduleSidebar';
import DisplayList from '../components/DisplayList';
import SongImporter from '../components/SongImporter';

const socket = io('http://localhost:3001'); // Adjust if needed

function Controller() {
  const [activeTab, setActiveTab] = useState('bible');
  const [activeContent, setActiveContent] = useState(null);
  const [activeDisplayId, setActiveDisplayId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        socket.emit('clearContent');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    socket.emit('registerController');

    socket.on('contentUpdate', (data) => setActiveContent(data));
    socket.on('contentClear', () => setActiveContent(null));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      socket.off('contentUpdate');
      socket.off('contentClear');
    };
  }, []);

  const handleSendContent = () => {
    socket.emit('showContent', {
      contentType: 'bible',
      contentId: 1,
      stanzaOrVerse: 'John 3:16',
    });
  };

  const handleClear = () => {
    socket.emit('clearContent');
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Controller Interface</Heading>

      <ButtonGroup isAttached variant="outline" mb={4}>
        {['bible', 'songs', 'announcements'].map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            colorScheme={activeTab === tab ? 'teal' : 'gray'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      <Box mb={6}>
        {activeTab === 'bible' && (
          <TabBible socket={socket} activeContent={activeContent} />
        )}
        {activeTab === 'songs' && (
          <TabSongs socket={socket} activeContent={activeContent} />
        )}
        {activeTab === 'announcements' && (
          <TabAnnouncements socket={socket} activeContent={activeContent} />
        )}
      </Box>

      <Flex gap={4} mb={6}>
        <Button colorScheme="blue" onClick={handleSendContent}>
          Send Sample Content
        </Button>
        <Button colorScheme="red" onClick={handleClear}>
          Clear
        </Button>
      </Flex>

      <Box mb={6}>
        <Text fontWeight="medium">Currently Displayed:</Text>
        <Code fontSize="sm" whiteSpace="pre-wrap">
          {activeContent ? JSON.stringify(activeContent, null, 2) : 'Nothing'}
        </Code>
      </Box>

      <Flex gap={6} align="flex-start" wrap="wrap">
        <Box flex="1" minW="300px">
          <ScheduleSidebar socket={socket} activeContent={activeContent} />
        </Box>
        <Box flex="1" minW="300px">
          <DisplayList
            activeDisplayId={activeDisplayId}
            setActiveDisplayId={setActiveDisplayId}
          />
          <Box mt={4}>
            <SongImporter />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default Controller;
