import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HomeController {

  @Get()
  findAll() {
    return 'Hi there, welcome to  the partner portal API';
  }
}
