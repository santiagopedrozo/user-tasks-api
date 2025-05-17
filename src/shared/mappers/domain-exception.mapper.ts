import { ForbiddenAuthAccessException } from '../../auth/errors/forbidden-auth-access.exception';
import { ThrottlerException } from '@nestjs/throttler';
import { UserAlreadyExistsException } from '../../users/errors/user-already-exists.exception';
import { ForbiddenTaskAccessException } from '../../tasks/errors/forbidden-access.exception';
import { TaskNotFoundException } from '../../tasks/errors/task-not-found.exception';
import { UserNotFoundException } from '../../users/errors/user-not-found.exception';

export class DomainExceptionMapper {
  private static readonly map = new Map<any, { status: number; error: string }>(
    [
      [ForbiddenTaskAccessException, { status: 403, error: 'Conflict' }],
      [ForbiddenAuthAccessException, { status: 403, error: 'Forbidden' }],
      [ThrottlerException, { status: 429, error: 'Too Many Requests' }],
      [UserAlreadyExistsException, { status: 409, error: 'Conflict' }],
      [TaskNotFoundException, { status: 404, error: 'Task not found' }],
      [UserNotFoundException, { status: 404, error: 'Task not found' }],
    ],
  );

  static toHttp(exception: unknown) {
    for (const [ExceptionClass, response] of this.map) {
      if (exception instanceof ExceptionClass) return response;
    }
    return null;
  }
}
