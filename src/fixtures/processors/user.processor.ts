import { IProcessor } from 'typeorm-fixtures-cli';
import { User } from '../../app/users/entities/user.entity';

export default class UserProcessor implements IProcessor<User> {
  private readonly emptyString: string;
  private readonly dot: string;
  private readonly underscore: string;
  private readonly atSign: string;

  constructor() {
    this.emptyString = '';
    this.dot = '.';
    this.underscore = '_';
    this.atSign = '@';
  }

  private normalizeValue(value: string): string {
    return value
      .toLowerCase()
      .replace(this.dot, this.emptyString)
      .replace(this.underscore, this.emptyString);
  }

  private normalizeEmail(email: string): string {
    const split = email.split(this.atSign);
    split[0] = this.normalizeValue(split[0]);
    return split.join(this.atSign);
  }

  preProcess(name: string, object: any): any {
    return {
      ...object,
      email: this.normalizeEmail(object.email),
      username: this.normalizeValue(object.username),
    };
  }
}
