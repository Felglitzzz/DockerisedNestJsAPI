import { Controller, Get, Res, HttpStatus } from '@nestjs/common';

@Controller('/')
export class HomeController {

  @Get()
  handleHomeRoute(@Res() res) {
    return res.status(HttpStatus.OK).json({
      message: 'Hi there, welcome to  the partner portal API'
    });
  }
}
