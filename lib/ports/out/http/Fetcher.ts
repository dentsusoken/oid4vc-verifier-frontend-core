import { GetRequest } from './GetRequest';
import { PostRequest } from './PostRequest';

export interface Fetcher {
  get: GetRequest;
  post: PostRequest;
}
