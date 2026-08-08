import { createServer } from './server';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;
const { server } = createServer();

server.listen(PORT, () => {
  logger.info(`🚀 Loadbyton API Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
