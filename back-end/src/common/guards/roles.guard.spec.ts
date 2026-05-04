import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  it('should be defined', () => {
    expect(new RolesGuard(new Reflector())).toBeDefined();
  });
});
