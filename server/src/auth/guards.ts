import { GraphQLContext } from '../types';
import { UserModel, type UserDocument } from '../models/user';
import { forbiddenError, unauthenticatedError } from '../errors';

export async function requireAuth(context: GraphQLContext): Promise<UserDocument> {
  if (!context.userId) {
    throw unauthenticatedError();
  }
  const user = await UserModel.findById(context.userId);
  if (!user) {
    throw unauthenticatedError();
  }
  return user;
}

export function requireActiveUser(user: UserDocument): void {
  if (user.status === 'DISABLED') {
    throw forbiddenError('Account disabled');
  }
}

export async function requireActiveUserFromContext(context: GraphQLContext): Promise<UserDocument> {
  const user = await requireAuth(context);
  requireActiveUser(user);
  return user;
}

export async function requireAdmin(context: GraphQLContext): Promise<UserDocument> {
  const user = await requireActiveUserFromContext(context);
  if (user.role !== 'ADMIN') {
    throw forbiddenError();
  }
  return user;
}
