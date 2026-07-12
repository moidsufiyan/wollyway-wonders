import { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.config.js';
import pkg from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WollyWay API Documentation',
      version: pkg.version,
      description: 'API services catalog for WollyWay handcrafted e-commerce platform',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development Server',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './dist/routes/**/*.js'], // Scans JSDoc comments
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('💚 Swagger documentation exposed at /api-docs');
};
