import { DomainException } from '../../shared/errors/domain-exception.base';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found');
  }
}
