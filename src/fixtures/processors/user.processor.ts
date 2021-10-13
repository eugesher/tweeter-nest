import { IProcessor } from 'typeorm-fixtures-cli';
import { User } from '../../app/users/entities/user.entity';

export default class UserProcessor implements IProcessor<User> {
  private readonly _emptyString: string;
  private readonly _dot: string;
  private readonly _underscore: string;
  private readonly _atSign: string;

  constructor() {
    this._emptyString = '';
    this._dot = '.';
    this._underscore = '_';
    this._atSign = '@';
  }

  private normalizeValue(value: string): string {
    return value
      .toLowerCase()
      .replace(this._dot, this._emptyString)
      .replace(this._underscore, this._emptyString);
  }

  private normalizeEmail(email: string): string {
    const split = email.split(this._atSign);
    split[0] = this.normalizeValue(split[0]);
    return split.join(this._atSign);
  }

  preProcess(name: string, object: any): any {
    const email = this.normalizeEmail(object.email);
    const username = this.normalizeValue(object.username);
    return { ...object, email, username };
  }
}
