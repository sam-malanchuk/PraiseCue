import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Stack,
  Badge,
  Link
} from '@chakra-ui/react';

function DisplayList({ activeDisplayId, setActiveDisplayId }) {
  const [displays, setDisplays] = useState([]);
  const [localIp, setLocalIp] = useState('localhost');

  const fetchDisplays = async () => {
    try {
      const res = await fetch('/api/displays');
      const data = await res.json();

      if (Array.isArray(data)) {
        setDisplays(data);
      } else {
        console.warn('Expected array of displays, got:', data);
        setDisplays([]);
      }
    } catch (err) {
      console.error('Failed to load displays:', err);
      setDisplays([]);
    }
  };

  useEffect(() => {
    fetchDisplays();

    // Attempt to detect local IP (fallback to localhost)
    const ip = window.location.hostname || 'localhost';
    setLocalIp(ip);
  }, []);

  const getNextAvailableDisplayNumber = () => {
    const used = new Set(
      displays.map((d) => parseInt(d.name.replace('Display ', '')))
    );
    for (let i = 1; i < 1000; i++) {
      if (!used.has(i)) return i;
    }
    return used.size + 1;
  };

  const createDisplay = async () => {
    const nextNum = getNextAvailableDisplayNumber();
    await fetch('/api/displays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Display ${nextNum}`, mode: 'solo' })
    });
    await fetchDisplays();
    setActiveDisplayId(nextNum);
  };

  const toggleMode = async (display) => {
    const newMode = display.mode === 'solo' ? 'follow' : 'solo';
    await fetch(`/api/displays/${display.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...display, mode: newMode })
    });
    fetchDisplays();
  };

  const deleteDisplay = async (id) => {
    await fetch(`/api/displays/${id}`, { method: 'DELETE' });
    fetchDisplays();
    if (activeDisplayId === id) setActiveDisplayId(null);
  };

  return (
    <Box mt={8}>
      <Flex justify="space-between" mb={3} align="center">
        <Text fontSize="xl" fontWeight="bold">Displays</Text>
        <Button colorScheme="teal" onClick={createDisplay}>+ New Display</Button>
      </Flex>

      <Stack spacing={4}>
        {displays.map((display) => {
          const displayUrl = `http://${localIp}/display/${display.display_number}`;
          const isActive = display.display_number === activeDisplayId;

          return (
            <Box
              key={display.id}
              p={4}
              borderRadius="md"
              borderWidth="1px"
              bg={isActive ? '#EDF2F7' : '#FFFFFF'}
              _dark={{
                bg: isActive ? '#2D3748' : '#1A202C'
              }}
              cursor="pointer"
              onClick={() => setActiveDisplayId(display.display_number)}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="medium">{display.name}</Text>
                  <Badge colorScheme={display.mode === 'follow' ? 'purple' : 'green'}>
                    {display.mode.toUpperCase()}
                  </Badge>
                  <Text fontSize="xs" mt={1}>
                    <Link href={displayUrl} target="_blank" color="blue.500">
                      {displayUrl}
                    </Link>
                  </Text>
                </Box>

                <Flex gap={2}>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    toggleMode(display);
                  }}>
                    Toggle Mode
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={(e) => {
                    e.stopPropagation();
                    deleteDisplay(display.id);
                  }}>
                    Remove
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
