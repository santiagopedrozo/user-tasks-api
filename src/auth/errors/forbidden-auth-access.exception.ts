import { DomainException } from '../../shared/errors/domain-exception.base';

export class ForbiddenAuthAccessException extends DomainException {
  constructor() {
    super('Access denied');
  }
}
