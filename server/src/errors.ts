import { GraphQLError } from 'graphql';

export function unauthenticatedError() {
  return new GraphQLError('UNAUTHENTICATED', { extensions: { code: 'UNAUTHENTICATED' } });
}

export function forbiddenError() {
  return new GraphQLError('FORBIDDEN', { extensions: { code: 'FORBIDDEN' } });
}

export function badUserInputError(message: string) {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}
