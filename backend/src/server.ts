import app from './app';
import { env } from './config/env.config';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Foundation Server successfully started on port ${env.PORT}`);
});

export default server;
