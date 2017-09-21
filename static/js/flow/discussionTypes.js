// @flow

export type Post = {
  id:            string,
  title:         string,
  author_id:     string,  // username
  score:         number,
  upvoted:       boolean,
  url:           ?string,
  text:          ?string,
  created:       string,
  num_comments:  number,
  channel_name:  string,
  profile_image: string,
}
