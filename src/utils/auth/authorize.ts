import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common'
import * as jwt from 'express-jwt'
import {expressJwtSecret} from 'jwks-rsa'

const auth0Domain = process.env.AUTH0_DOMAIN
const appUrl = process.env.APP_URL
const appPort = process.env.APP_PORT

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
    resolve(): MiddlewareFunction {
        return jwt({
            secret: expressJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
            }),
            audience: `http://${appUrl}:${appPort}/`,
            issuer: `https://${auth0Domain}/`,
            algorithm: 'RS256',
        })
    }
}