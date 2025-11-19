/**
 * Swagger/OpenAPI Configuration
 * 
 * API dokümantasyonu için Swagger yapılandırması.
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { getEnv } from './envValidation';

const env = getEnv();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mivvo Expertiz API',
      version: '1.0.0',
      description: 'Yapay zeka destekli araç expertiz uygulaması API dokümantasyonu',
      contact: {
        name: 'Mivvo Expertiz',
        email: 'support@mivvo.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://mivvo.up.railway.app/api'
          : 'http://localhost:3001/api',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'ErrorType',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            statusCode: {
              type: 'number',
              example: 400,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            path: {
              type: 'string',
              example: '/api/endpoint',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Success message',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

