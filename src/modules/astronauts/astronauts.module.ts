import { Module } from '@nestjs/common';
import { AstronautsController } from './astronauts.controller';
import { AstronautsService } from './astronauts.service';

@Module({
  controllers: [AstronautsController],
  providers: [AstronautsService],
  exports: [AstronautsService],
})
export class AstronautsModule {}
