import React, { useState } from 'react';
import { Box, Heading, Input, Textarea, Button } from '@chakra-ui/react';

export default function AnnouncementImporter() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      alert('Both title and body are required');
      return;
    }

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setTitle('');
      setBody('');
      alert('Announcement saved successfully');
    } catch (err) {
      console.error(err);
      alert('Error saving announcement');
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} mb={4}>
      <Heading size="sm" mb={2}>Import Announcement</Heading>
      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        mb={2}
      />
      <Textarea
        placeholder="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        mb={2}
      />
      <Button size="sm" colorScheme="teal" onClick={handleSubmit}>
        Save Announcement
      </Button>
    </Box>
  );
}
