import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Text
} from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';
import TabBible from '../components/TabBible';
import TabSongs from '../components/TabSongs';
import TabAnnouncements from '../components/TabAnnouncements';
import ScheduleSidebar from '../components/ScheduleSidebar';
import DisplayList from '../components/DisplayList';
import SongImporter from '../components/SongImporter';
import AnnouncementImporter from '../components/AnnouncementImporter';

function Controller() {
  const { socket, activeContent, activeDisplayId, setActiveDisplayId } = useAppContext();
  const [activeTab, setActiveTab] = useState('bible');
  const tabs = ['bible', 'songs', 'announcements'];

  // Handle ESC to clear content
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        socket.emit('clearContent');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket]);

  return (
    <Box p={4}>
      <Heading mb={4}>PraiseCue Controller</Heading>

      <ButtonGroup mb={6} isAttached>
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            colorScheme={activeTab === tab ? 'teal' : 'gray'}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </ButtonGroup>

      <Flex>
        <Box flex="2" mr={4}>
          {activeTab === 'bible' && <TabBible />}
          {activeTab === 'songs' && <TabSongs />}
          {activeTab === 'announcements' && <TabAnnouncements />}
        </Box>

        <Box flex="1" mr={4}>
          <ScheduleSidebar />
        </Box>

        <Box flex="1" minW="300px">
          <DisplayList />
          <Box mt={4}>
            <SongImporter />
            <AnnouncementImporter />
          </Box>
        </Box>
      </Flex>

      <Text mt={4} fontSize="sm">
        Active Display: {activeDisplayId || 'None'} | Active Content: {activeContent?.contentType || 'None'}
      </Text>
    </Box>
  );
}

export default Controller;
