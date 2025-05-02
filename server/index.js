const { createServer } = require('http');
const app = require('./app');
const { initSocket } = require('./socket');

const server = createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`API+Socket listening on port ${PORT}`));
