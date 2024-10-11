import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export default function setupSwagger(app: NestExpressApplication) {
  // Swagger Setup
  const builder = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'API')
    .setDescription(process.env.SWAGGER_DESCRIPTION || 'API Documentation')
    .setVersion(process.env.SWAGGER_API_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth', // This is an arbitrary identifier for the security scheme.
    )
    .addSecurityRequirements('JWT-auth'); // Apply the security requirement globally

  const options = builder.build();
  const swaggerDoc = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/swagger', app, swaggerDoc);
}
