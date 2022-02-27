import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomLoggerModule } from './custom-logger/custom-logger.module';
import { LoggingInterceptor } from './interceptors/logging.inspector';

@Module({
  imports: [CustomLoggerModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
