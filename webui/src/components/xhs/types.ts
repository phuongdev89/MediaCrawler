export interface XhsPost {
  [key: string]: unknown
  note_id: string
  type?: string
  title?: string
  desc?: string
  video_url?: string
  time?: number
  last_update_time?: number
  creator_hash?: string
  nickname?: string
  liked_count?: string
  collected_count?: string
  comment_count?: string
  share_count?: string
  image_list?: string
  tag_list?: string
  title_vi?: string
  desc_vi?: string
  tag_list_vi?: string
  is_translated?: number
  last_modify_ts?: number
  note_url?: string
  source_keyword?: string
  xsec_token?: string
}

export interface XhsComment {
  [key: string]: unknown
  comment_id: string
  create_time?: number
  note_id: string
  content?: string
  creator_hash?: string
  nickname?: string
  sub_comment_count?: string
  pictures?: string
  parent_comment_id?: string
  last_modify_ts?: number
  like_count?: string
}
