import React, { useEffect, useState } from 'react';
import { Box, Heading, List, ListItem, Text, IconButton } from '@chakra-ui/react';
import { MdDelete } from 'react-icons/md';
import { useAppContext } from '../context/AppContext';

function ScheduleSidebar() {
  const { socket, activeDisplayId } = useAppContext();
  const displayId = activeDisplayId;
  const [schedule, setSchedule] = useState([]);

  // Fetch schedule when displayId changes
  useEffect(() => {
    if (!displayId) return;
    fetch(`/api/schedules/${displayId}`)
      .then((res) => res.json())
      .then((data) => setSchedule(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [displayId]);

  const handlePlayItem = (item) => {
    socket.emit('showContent', {
      contentType: item.type,
      contentId: item.item_id,
      stanzaOrVerse: item.stanza_or_verse,
      targetGroup: null,
    });
  };

  const removeItem = (itemId) => {
    const remaining = schedule.filter((i) => i.id !== itemId);
    // Overwrite schedule via POST
    fetch(`/api/schedules/${displayId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: remaining }),
    })
      .then((res) => res.json())
      .then(() => setSchedule(remaining))
      .catch(console.error);
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} mb={4}>
      <Heading size="sm" mb={3}>Schedule</Heading>
      <List spacing={2}>
        {schedule.length ? (
          schedule.map((item) => (
            <ListItem key={item.id} display="flex" alignItems="center" justifyContent="space-between">
              <Text cursor="pointer" onClick={() => handlePlayItem(item)}>
                {item.type}: {item.stanza_or_verse || item.item_id}
              </Text>
              <IconButton
                size="sm"
                aria-label="Remove item"
                icon={<MdDelete />}
                onClick={() => removeItem(item.id)}
              />
            </ListItem>
          ))
        ) : (
          <Text fontSize="sm" color="gray.500">No scheduled items</Text>
        )}
      </List>
    </Box>
  );
}

export default ScheduleSidebar;
