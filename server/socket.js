const displayMap = new Map();

module.exports = (socket, io, db) => {
  // Register a display on connection
  socket.on('registerDisplay', ({ displayNumber, mode, groupId }) => {
    displayMap.set(socket.id, { displayNumber, mode, groupId });
    socket.join(`display_${displayNumber}`);
    if (mode === 'follow' && groupId) {
      socket.join(`group_${groupId}`);
    }
    // Send current active content if exists
    db.get('SELECT * FROM active_content WHERE id = 1', [], (err, row) => {
      if (!err && row && row.content_type) {
        const payload = {
          contentType: row.content_type,
          contentId: row.content_id,
          stanzaOrVerse: row.stanza_or_verse,
          targetDisplays: JSON.parse(row.target_displays || '[]'),
          targetGroup: row.target_group
        };
        socket.emit('contentUpdate', payload);
      }
    });
  });

  // Handle content publish from controller
  socket.on('showContent', (data) => {
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO active_content
       (id, content_type, content_id, stanza_or_verse, target_displays, target_group)
       VALUES (1, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      data.contentType,
      data.contentId,
      data.stanzaOrVerse || null,
      JSON.stringify(data.targetDisplays || []),
      data.targetGroup || null
    );
    stmt.finalize();

    // Broadcast to specified display rooms
    (data.targetDisplays || []).forEach((num) => {
      io.to(`display_${num}`).emit('contentUpdate', data);
    });
    // Broadcast to follow-group rooms
    if (data.targetGroup) {
      io.to(`group_${data.targetGroup}`).emit('contentUpdate', data);
    }
    // Update all controllers
    io.emit('contentUpdate', data);
  });

  // Clear content (e.g. ESC)
  socket.on('clearContent', () => {
    db.run('DELETE FROM active_content WHERE id = 1', (err) => {
      if (err) console.error('Error clearing active_content:', err);
      io.emit('contentClear');
    });
  });

  // When a controller selects a display, broadcast to all controllers
  socket.on('selectDisplay', (displayNumber) => {
    console.log('Display selected:', displayNumber);
    io.emit('displaySelected', { displayNumber });
  });

  socket.on('disconnect', () => {
    const info = displayMap.get(socket.id);
    displayMap.delete(socket.id);
    if (info) {
      socket.leave(`display_${info.displayNumber}`);
      if (info.mode === 'follow' && info.groupId) {
        socket.leave(`group_${info.groupId}`);
      }
    }
    console.log('Socket disconnected:', socket.id);
  });
};
