import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { XhsComment, XhsPost } from './types'

interface XiaohongshuPostDialogProps {
  post: XhsPost | null
  comments: XhsComment[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function splitList(value?: string) {
  if (!value) return []
  let trimmed = value.trim()
  // Handle JSON stringified arrays or objects
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed))
        return parsed
          .map((item) =>
            String(item)
              .trim()
              .replace(/^["']|["']$/g, '')
          )
          .filter(Boolean)
    } catch (_) {}
  }
  // Handle JSON stringified single string or wrapped quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (typeof parsed === 'string') trimmed = parsed
    } catch (_) {
      trimmed = trimmed.replace(/^"|"$/g, '')
    }
  }
  return (
    trimmed
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean) ?? []
  )
}

function formatMetric(value?: string | number) {
  return value === undefined || value === null || value === '' ? '0' : String(value)
}

function formatPostDate(value?: number) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function XiaohongshuPostDialog({
  post,
  comments,
  open,
  onOpenChange,
}: XiaohongshuPostDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const images = useMemo(() => splitList(post?.image_list), [post?.image_list])
  const tags = useMemo(() => {
    // Attempt to read Vietnamese tags, fall back to standard tags
    const rawTags = post?.tag_list_vi || post?.tag_list
    return splitList(rawTags)
  }, [post?.tag_list, post?.tag_list_vi])
  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parent_comment_id),
    [comments]
  )

  if (!post) return null

  const isVideo = post.type === 'video' && !!post.video_url
  const videoSrc = isVideo
    ? `/api/data/media-proxy?url=${encodeURIComponent(splitList(post.video_url)[0] ?? '')}`
    : undefined
  const activeImage = images[activeImageIndex] ?? images[0]
  const hasMultipleImages = images.length > 1

  const showPreviousImage = () => {
    setActiveImageIndex((index) => (index === 0 ? images.length - 1 : index - 1))
  }

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % images.length)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setActiveImageIndex(0)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="max-w-6xl h-[90vh] grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] grid-rows-[1fr] gap-0 overflow-hidden p-0">
        <div className="bg-[#050507] border-b lg:border-b-0 lg:border-r border-cyber-border-subtle flex flex-col overflow-hidden">
          <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
            {isVideo && videoSrc ? (
              <video
                key={videoSrc}
                src={videoSrc}
                controls
                playsInline
                className="relative z-10 max-h-full max-w-full object-contain"
                poster={activeImage}
              />
            ) : activeImage ? (
              <>
                <img
                  src={activeImage}
                  alt={`${post.title || post.note_id} image ${activeImageIndex + 1}`}
                  className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-25"
                  aria-hidden="true"
                />
                <img
                  src={activeImage}
                  alt={`${post.title || post.note_id} image ${activeImageIndex + 1}`}
                  className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl"
                />
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                  <Badge className="bg-black/55 border-white/20 text-white backdrop-blur">
                    {activeImageIndex + 1}/{images.length}
                  </Badge>
                  <Badge className="bg-black/55 border-white/20 text-white backdrop-blur">
                    {post.type || 'normal'}
                  </Badge>
                </div>
                {hasMultipleImages && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={showPreviousImage}
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-cyber-neon-cyan"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={showNextImage}
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 text-white hover:bg-black/65 hover:text-cyber-neon-cyan"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-cyber-border-subtle bg-cyber-bg-secondary px-6 py-10 text-cyber-text-muted font-mono">
                No image captured
              </div>
            )}
          </div>

          {!isVideo && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black/40 p-3 terminal-scroll">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border transition-all ${
                    activeImageIndex === index
                      ? 'border-cyber-neon-cyan shadow-glow-cyan-sm opacity-100'
                      : 'border-white/10 opacity-55 hover:opacity-90'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${post.title || post.note_id} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex flex-col bg-cyber-bg-panel overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-5 border-b border-cyber-border-subtle text-left space-y-3">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="min-w-0 space-y-2">
                <DialogTitle className="text-xl leading-tight text-cyber-text-primary font-sans flex items-start gap-2">
                  <span>{post.title_vi || post.title || 'Untitled note'}</span>
                  {post.is_translated === 1 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] mt-0.5 border-cyber-neon-green text-cyber-neon-green bg-cyber-neon-green/5"
                    >
                      VI
                    </Badge>
                  )}
                </DialogTitle>
                {post.title_vi && post.title && post.title_vi !== post.title && (
                  <p className="text-xs text-cyber-text-muted italic">{post.title}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{post.type || 'normal'}</Badge>
                  {post.source_keyword && <Badge variant="secondary">#{post.source_keyword}</Badge>}
                  <span className="text-xs text-cyber-text-muted font-mono">
                    {formatPostDate(post.time)}
                  </span>
                </div>
              </div>
              {post.note_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs flex-shrink-0"
                  onClick={() => window.open(post.note_url, '_blank')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyber-neon-pink/60 to-cyber-neon-cyan/60 border border-cyber-border-subtle" />
              <div>
                <div className="font-semibold text-cyber-text-primary">
                  {post.nickname || 'Unknown creator'}
                </div>
                <div className="text-xs text-cyber-text-muted font-mono">{post.creator_hash}</div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-cyber-text-primary">
                {post.desc_vi || post.desc || 'No description'}
              </p>
              {post.desc_vi && post.desc && post.desc_vi !== post.desc && (
                <div className="rounded border border-cyber-border-subtle bg-cyber-bg-tertiary/20 p-3 text-xs leading-5 text-cyber-text-muted">
                  <div className="font-semibold mb-1 text-[11px] uppercase tracking-wider text-cyber-text-secondary">
                    Original text (CN):
                  </div>
                  <p className="whitespace-pre-wrap">{post.desc}</p>
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-sm text-cyber-neon-cyan hover:underline">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/40 p-3">
                <div className="text-center">
                  <Heart className="w-4 h-4 mx-auto text-cyber-neon-pink" />
                  <div className="text-sm font-mono text-cyber-text-primary mt-1">
                    {formatMetric(post.liked_count)}
                  </div>
                  <div className="text-[10px] text-cyber-text-muted">Likes</div>
                </div>
                <div className="text-center">
                  <Star className="w-4 h-4 mx-auto text-cyber-neon-yellow" />
                  <div className="text-sm font-mono text-cyber-text-primary mt-1">
                    {formatMetric(post.collected_count)}
                  </div>
                  <div className="text-[10px] text-cyber-text-muted">Collects</div>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-4 h-4 mx-auto text-cyber-neon-green" />
                  <div className="text-sm font-mono text-cyber-text-primary mt-1">
                    {formatMetric(post.comment_count)}
                  </div>
                  <div className="text-[10px] text-cyber-text-muted">Comments</div>
                </div>
                <div className="text-center">
                  <Share2 className="w-4 h-4 mx-auto text-cyber-neon-purple" />
                  <div className="text-sm font-mono text-cyber-text-primary mt-1">
                    {formatMetric(post.share_count)}
                  </div>
                  <div className="text-[10px] text-cyber-text-muted">Shares</div>
                </div>
              </div>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono font-bold text-cyber-neon-cyan">Comments</h3>
                  <Badge variant="outline">{topLevelComments.length}</Badge>
                </div>

                {topLevelComments.length > 0 ? (
                  <div className="space-y-3">
                    {topLevelComments.map((comment) => (
                      <article
                        key={comment.comment_id}
                        className="rounded-lg border border-cyber-border-subtle bg-cyber-bg-tertiary/30 p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyber-bg-elevated border border-cyber-border-subtle flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-cyber-text-primary">
                                {comment.nickname || 'Anonymous'}
                              </span>
                              <span className="text-[10px] text-cyber-text-muted font-mono">
                                {formatPostDate(comment.create_time)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-cyber-text-secondary whitespace-pre-wrap">
                              {comment.content || '-'}
                            </p>
                            {comment.pictures &&
                              splitList(comment.pictures).map((pic, i) => (
                                <img
                                  key={i}
                                  src={pic}
                                  alt={`comment attachment ${i + 1}`}
                                  className="mt-2 h-24 w-24 rounded-md object-cover border border-cyber-border-subtle"
                                  loading="lazy"
                                />
                              ))}
                            <div className="mt-2 flex items-center gap-3 text-[10px] text-cyber-text-muted font-mono">
                              <span>{formatMetric(comment.like_count)} likes</span>
                              <span>{formatMetric(comment.sub_comment_count)} replies</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-cyber-border-subtle p-6 text-center text-sm text-cyber-text-muted font-mono">
                    No comments captured for this note
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
