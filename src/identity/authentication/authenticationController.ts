import { Controller, Get, UseGuards, Res, Req, Inject, Param} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { TYPES } from '../../types'

import { IUserService } from '../user/userService'

@Controller()
export class AuthenticationController {
  private readonly userService: IUserService

  public constructor(@Inject(TYPES.IUserService) userService: IUserService) {
    this.userService = userService
  }

  @Get('/auth/google')
  @UseGuards(AuthGuard('google'))
  googleLogin()
  {
  }

  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res)
  {
    const jwt = await this.userService.validateUser(req.user.email)

    res.redirect(`http://localhost:3000/root/${jwt}`)
  }

  @Get('/auth/auth0')
  @UseGuards(AuthGuard('auth0'))
  auth0Login()
  {
  }

  @Get('/auth/auth0/callback')
  @UseGuards(AuthGuard('auth0'))
  async auth0LoginCallback(@Req() req, @Res() res)
  {
    const jwt = await this.userService.validateUser(req.user.email)

    res.redirect(`http://localhost:3000/root/${jwt}`)
  }

  @Get('/login')
  login(@Res() res)
  {
    res.redirect('http://localhost:3000/auth/auth0')
  }

  @Get('root/:jwt')
  index(@Param('jwt') jwt)
  {
    return { message: 'Welcome to MyAndela', jwt}
  }

  @Get('test/token')
  async testToken(@Req() req, @Res() res)
  {
    const jwt = await this.userService.validateUser(req.user.email)

    res.redirect(`http://localhost:3000/root/${jwt}`)
  }

  @Get('health/alive')
  async alive(@Req() req, @Res() res)
  {
    res.send('OK')
  }
}
