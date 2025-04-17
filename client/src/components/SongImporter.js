import React, { useState } from 'react';
import { Box, Button, Text, Input, Textarea, Heading, VStack } from '@chakra-ui/react';
import { useAppContext } from '../context/AppContext';

function parseSongMarkdown(md) {
  const lines = md.trim().split('\n');
  let title = '';
  const stanzas = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
    } else if (line.startsWith('## ')) {
      if (current) stanzas.push(current);
      current = { title: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) stanzas.push(current);
  return { title, stanzas };
}

export default function SongImporter() {
  const { activeDisplayId } = useAppContext();
  const [md, setMd] = useState('');
  const [preview, setPreview] = useState(null);

  const handleParse = () => {
    const parsed = parseSongMarkdown(md);
    setPreview(parsed);
  };

  const handleSave = async () => {
    if (!preview?.title || preview.stanzas.length === 0) {
      alert('Song must have a title and at least one stanza');
      return;
    }
    try {
      await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: preview.title,
          tags: [],
          content: preview.stanzas,
        }),
      });
      setMd('');
      setPreview(null);
      alert('Song saved successfully');
    } catch (err) {
      console.error(err);
      alert('Error saving song');
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Heading size="sm" mb={2}>Import Song (Markdown)</Heading>
      <Textarea
        value={md}
        onChange={(e) => setMd(e.target.value)}
        placeholder="# Song Title\n## Verse 1\nLine 1\nLine 2"
        rows={6}
        mb={2}
      />
      <Button size="sm" onClick={handleParse} mb={2}>Preview</Button>

      {preview && (
        <Box mb={2} borderWidth="1px" borderRadius="md" p={2}>
          <Text><strong>Title:</strong> {preview.title}</Text>
          <VStack spacing={2} align="stretch" mt={2}>
            {preview.stanzas.map((s, i) => (
              <Box key={i}>
                <Text><strong>{s.title}</strong></Text>
                <Box as="pre" whiteSpace="pre-wrap">{s.lines.join('\n')}</Box>
              </Box>
            ))}
          </VStack>
          <Button size="sm" colorScheme="teal" onClick={handleSave} mt={2}>Save to Library</Button>
        </Box>
      )}
    </Box>
  );
}
