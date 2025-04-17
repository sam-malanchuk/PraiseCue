import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, Stack, Badge, Link } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

function DisplayList() {
  const { socket, activeDisplayId, setActiveDisplayId } = useAppContext();
  const [displays, setDisplays] = useState([]);
  const localIp = window.location.hostname;

  // Fetch displays from server
  const fetchDisplays = async () => {
    try {
      const res = await fetch('/api/displays');
      const data = await res.json();
      setDisplays(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Subscribe to remote selection
    socket.on('displaySelected', ({ displayNumber }) => {
      setActiveDisplayId(displayNumber);
    });
    // Subscribe to display list updates
    socket.on('displaysUpdated', () => {
      fetchDisplays();
    });

    // Initial load
    fetchDisplays();

    return () => {
      socket.off('displaySelected');
      socket.off('displaysUpdated');
    };
  }, [socket]);

  const createDisplay = async () => {
    try {
      await fetch('/api/displays', { method: 'POST' });
      socket.emit('displaysUpdated');
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDisplay = async (id, number) => {
    try {
      await fetch(`/api/displays/${id}`, { method: 'DELETE' });
      if (activeDisplayId === number) {
        setActiveDisplayId(null);
        socket.emit('displaySelected', null);
      }
      socket.emit('displaysUpdated');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMode = async (display) => {
    const newMode = display.mode === 'solo' ? 'follow' : 'solo';
    try {
      await fetch(`/api/displays/${display.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: display.name,
          mode: newMode,
          groupId: display.group_id
        }),
      });
      socket.emit('displaysUpdated');
    } catch (err) {
      console.error(err);
    }
  };

  const selectDisplay = (display) => {
    setActiveDisplayId(display.display_number);
    socket.emit('selectDisplay', display.display_number);
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} mb={4}>
      <Flex justifyContent="space-between" mb={3}>
        <Text fontSize="xl" fontWeight="bold">Displays</Text>
        <Button size="sm" colorScheme="teal" onClick={createDisplay}>+ New</Button>
      </Flex>

      <Stack spacing={3}>
        {displays.map((display) => {
          const isActive = display.display_number === activeDisplayId;
          const displayUrl = `http://${localIp}/display/${display.display_number}`;

          return (
            <Box
              key={display.id}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              bg={isActive ? 'teal.50' : 'white'}
              cursor="pointer"
              onClick={() => selectDisplay(display)}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Box>
                  <Text fontWeight="medium">{display.name}</Text>
                  <Badge colorScheme={display.mode === 'follow' ? 'purple' : 'green'}>
                    {display.mode.toUpperCase()}
                  </Badge>
                  <Text fontSize="xs" mt={1}>
                    <Link href={displayUrl} target="_blank">
                      {displayUrl}
                    </Link>
                  </Text>
                </Box>

                <Flex gap={2}>
                  <Button
                    size="xs"
                    onClick={(e) => { e.stopPropagation(); toggleMode(display); }}
                  >
                    Mode
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={(e) => { e.stopPropagation(); deleteDisplay(display.id, display.display_number); }}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

export default DisplayList;
