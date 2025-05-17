import { DomainException } from '../../shared/errors/domain-exception.base';

export class ForbiddenUserRoleDeleteException extends DomainException {
  constructor() {
    super('Only own user or admin can delete user');
  }
}
