import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = Object.keys(TaskStatus);
  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      // not validate
      throw new BadRequestException(`${value} is an invalid stattus`);
    }
    return value;
  }

  private isStatusValid(status: string) {
    return this.allowedStatuses.indexOf(status) >= 0;
  }
}
