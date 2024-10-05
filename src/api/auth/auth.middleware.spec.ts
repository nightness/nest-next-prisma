import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';

// TODO: FINISH THE TEST
describe('AuthMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthMiddleware(
      new JwtService({}),      
    )).toBeDefined();
  });
});
