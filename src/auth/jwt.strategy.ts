// src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Better to use environment variable
    });
  }

  async validate(payload: any) {
    try {
      // Find the user by the ID stored in the JWT payload
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Create a custom user object without sensitive data
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        // Add any other necessary user data
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}