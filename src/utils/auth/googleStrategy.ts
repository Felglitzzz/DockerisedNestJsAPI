import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		super({
			clientID: googleClientId,
			clientSecret: googleClientSecret,
			callbackURL: `/auth/google/callback`,
			passReqToCallback: true,
			scope: ['profile'],
		})
	}

	async validate(request: any, accessToken: string, refreshToken: string, profile, done: (error, user) => void) {
		const user = {
			accessToken,
			firstName: profile.name.givenName,
			lastName: profile.name.familyName,
			// email: profile.emails[0].value,
			picture: profile.photos[0].value,
			name: profile.displayName,
		  }
		done(null, user)
	}
}