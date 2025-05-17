import { DomainException } from '../../../shared/errors/domain-exception.base';

export class TaskNotFoundException extends DomainException {
  constructor() {
    super('Task not found');
  }
}
