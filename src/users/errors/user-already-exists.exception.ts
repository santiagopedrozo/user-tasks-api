import { DomainException } from '../../shared/errors/domain-exception.base';

export class UserAlreadyExistsException extends DomainException {
  constructor() {
    super('User already exists');
  }
}
