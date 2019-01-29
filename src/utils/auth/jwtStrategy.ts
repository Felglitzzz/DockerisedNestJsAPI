import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserDto } from '../../identity/user/userDtos'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt')
{
	constructor()
	{
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_AUTH_PRIVATE_KEY,
			passReqToCallback: true,
		})
	}

	async validate(request: any, user: UserDto, done: (error, user) => void)
	{
		const path = request.baseUrl

		if (!user.role || !user.role.permissions) {
			throw new UnauthorizedException(`No role or permission for user ${user.name}`)
		}

		if (!user.role.permissions.some(permission => permission.resourceBaseUrl === path)) {
			throw new UnauthorizedException(`No permission for user ${user.name} with role ${user.role.name} to access ${path}`)
		}

		try
		{
			done(null, user)
		}
		catch (err)
		{
			throw new UnauthorizedException('Unauthorized', err.message)
		}
	}
}