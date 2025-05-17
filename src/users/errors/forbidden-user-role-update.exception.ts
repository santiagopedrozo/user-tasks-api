import { DomainException } from '../../shared/errors/domain-exception.base';

export class ForbiddenUserRoleUpdateException extends DomainException {
  constructor() {
    super('Only admins can update user roles');
  }
}
