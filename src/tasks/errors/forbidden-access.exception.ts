import { DomainException } from '../../shared/errors/domain-exception.base';

export class ForbiddenTaskAccessException extends DomainException {
  constructor() {
    super('Forbidden resource access');
  }
}
