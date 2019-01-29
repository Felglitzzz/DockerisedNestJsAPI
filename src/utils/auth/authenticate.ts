import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common'
import { authenticate } from 'passport'

const auth0Domain = process.env.AUTH0_DOMAIN
const auth0ClientId = process.env.AUTH0_CLIENT_ID

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
        return authenticate('auth0', {
            clientID: auth0ClientId,
            domain: auth0Domain,
            audience: 'https://' + auth0Domain + '/userinfo',
          })
    }
}