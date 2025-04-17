module.exports = (socket, io, db) => {
  // Controller sends content to show
  socket.on('showContent', (data) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO active_content (id, content_type, content_id, stanza_or_verse, display_group_id)
      VALUES (1, ?, ?, ?, ?)
    `);

    stmt.run(
      data.contentType,
      data.contentId,
      data.stanzaOrVerse || null,
      data.displayGroupId || null
    );

    // Selectively send updates
    io.sockets.sockets.forEach((clientSocket) => {
      const s = clientSocket.data;
      if (!s?.displayId) return;

      const isFollow =
        s.mode === 'follow' && s.groupId === data.displayGroupId;

      const isSolo =
        s.mode === 'solo' &&
        (!data.displayGroupId || s.displayId === data.displayGroupId);

      if (isFollow || isSolo) {
        clientSocket.emit('contentUpdate', data);
      }
    });
  });

  // Controller clears content (ESC or toggle)
  socket.on('clearContent', () => {
    db.run(`DELETE FROM active_content WHERE id = 1`);
    io.emit('contentClear');
  });

  // Display joins
  socket.on('registerDisplay', (displayId) => {
    console.log(`Display ${displayId} connected.`);

    db.get('SELECT * FROM displays WHERE id = ?', [displayId], (err, display) => {
      if (err || !display) return;

      socket.data.displayId = display.id;
      socket.data.mode = display.mode;
      socket.data.groupId = display.group_id;

      // Send current content if eligible
      db.get('SELECT * FROM active_content WHERE id = 1', [], (err, row) => {
        if (!err && row && row.content_type && row.stanza_or_verse) {
          const shouldFollow =
            display.mode === 'follow' && row.display_group_id === display.group_id;

          const shouldSolo =
            display.mode === 'solo' &&
            (!row.display_group_id || row.display_group_id === display.id);

          if (shouldFollow || shouldSolo) {
            socket.emit('contentUpdate', {
              contentType: row.content_type,
              contentId: row.content_id,
              stanzaOrVerse: row.stanza_or_verse,
              displayGroupId: row.display_group_id || null
            });
          }
        }
      });
    });
  });

  // Controller joins
  socket.on('registerController', () => {
    console.log(`Controller connected.`);

    db.get('SELECT * FROM active_content WHERE id = 1', [], (err, row) => {
      if (!err && row && row.content_type && row.stanza_or_verse) {
        socket.emit('contentUpdate', {
          contentType: row.content_type,
          contentId: row.content_id,
          stanzaOrVerse: row.stanza_or_verse,
          displayGroupId: row.display_group_id || null
        });
      }
    });
  });

  // Cleanup
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
};
