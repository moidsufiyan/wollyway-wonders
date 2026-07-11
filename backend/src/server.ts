import app from './app.js';
import { env } from './config/env.config.js';


const server = app.listen(env.PORT, () => {
  console.log(`🚀 Foundation Server successfully started on port ${env.PORT}`);
});

export default server;
