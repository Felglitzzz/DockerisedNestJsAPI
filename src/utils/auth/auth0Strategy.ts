import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-auth0'

const auth0Domain = process.env.AUTH0_DOMAIN
const auth0ClientId = process.env.AUTH0_CLIENT_ID
const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
	constructor() {
		super({
			domain: auth0Domain,
			clientID: auth0ClientId,
			clientSecret: auth0ClientSecret,
			callbackURL: '/auth/auth0/callback',
			state: false,
		})
	}

	async validate(accessToken: string, refreshToken: string, profile, done: (error, user) => void) {
		const user = {
			accessToken,
			firstName: profile.name.givenName,
			lastName: profile.name.familyName,
			email: profile.emails[0].value,
			picture: profile.picture,
			name: profile.displayName,
		}
		done(null, user)
	}
}