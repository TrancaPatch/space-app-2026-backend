import { Module } from '@nestjs/common';
import { AnatomicalSystemsController } from './anatomical-systems.controller';
import { AnatomicalSystemsService } from './anatomical-systems.service';

@Module({
  imports: [],
  controllers: [AnatomicalSystemsController],
  providers: [AnatomicalSystemsService],
  exports: [AnatomicalSystemsService],
})
export class AnatomicalSystemsModule {}
