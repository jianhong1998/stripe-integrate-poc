import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const docsConfig = new DocumentBuilder()
        .setTitle('Payment App API Documentation')
        .setDescription('This is the API documentation for Payment App.')
        .setVersion('1.0')
        .build();

    const openApi = SwaggerModule.createDocument(app, docsConfig);

    SwaggerModule.setup('docs', app, openApi);

    await app.listen(3001);
}
bootstrap();
