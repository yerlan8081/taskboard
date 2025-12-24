import { getUserIdFromAuthHeader, createToken, hashPassword, verifyPassword } from '../../auth';
import { requireAuthenticatedUser } from '../../graphql/resolvers';
import { GraphQLError } from 'graphql';

describe('auth helpers', () => {
  it('hashes and verifies password correctly', async () => {
    const password = 'P@ssw0rd!';
    const hash = await hashPassword(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it('fails verification for wrong password', async () => {
    const password = 'P@ssw0rd!';
    const hash = await hashPassword(password);
    await expect(verifyPassword('bad', hash)).resolves.toBe(false);
  });

  it('creates and reads JWT token', () => {
    const token = createToken('user-123');
    const userId = getUserIdFromAuthHeader(`Bearer ${token}`);
    expect(userId).toBe('user-123');
  });

  it('returns null for invalid token header', () => {
    const userId = getUserIdFromAuthHeader('Bearer bad.token.here');
    expect(userId).toBeNull();
  });

  it('throws UNAUTHENTICATED when context is missing user', () => {
    try {
      requireAuthenticatedUser({ userId: null });
      throw new Error('Expected to throw');
    } catch (error) {
      const graphQLError = error as GraphQLError;
      expect(graphQLError.extensions?.code).toBe('UNAUTHENTICATED');
    }
  });
});
