import { IProcessor } from 'typeorm-fixtures-cli';
import { Tweet } from '../../app/tweets/entities/tweet.entity';

export default class TweetProcessor implements IProcessor<Tweet> {
  private readonly imageWidthDefault: string = '640';
  private readonly imageHeightDefault: string = '480';
  private readonly imageWidthToSet: string = '800';
  private readonly imageHeightToSet: string = '600';

  private normalizeImageLink(imageLink: string): string {
    return imageLink
      .replace(this.imageWidthDefault, this.imageWidthToSet)
      .replace(this.imageHeightDefault, this.imageHeightToSet);
  }

  preProcess(name: string, object: any): any {
    const image =
      Math.random() < 0.5 ? null : this.normalizeImageLink(object.image);

    return { ...object, image };
  }
}
