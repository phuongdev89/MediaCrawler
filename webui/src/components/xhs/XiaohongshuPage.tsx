import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { dataApi, configApi } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import { XiaohongshuPostDialog } from './XiaohongshuPostDialog'
import type { XhsComment, XhsPost } from './types'

type SortKey =
  | 'title'
  | 'nickname'
  | 'source_keyword'
  | 'liked_count'
  | 'collected_count'
  | 'comment_count'
  | 'last_modify_ts'
type SortDirection = 'asc' | 'desc'

const PAGE_SIZE_OPTIONS = [10, 12, 20, 50, 100]

function isXhsPost(value: Record<string, unknown>): value is XhsPost {
  return typeof value.note_id === 'string'
}

function isXhsComment(value: Record<string, unknown>): value is XhsComment {
  return typeof value.comment_id === 'string' && typeof value.note_id === 'string'
}

function metricValue(value?: string) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function dateValue(post: XhsPost) {
  return post.last_modify_ts ?? post.time ?? 0
}

function formatXhsDate(value?: number) {
  if (!value) return '-'
  return formatDateTime(value > 10_000_000_000 ? value / 1000 : value)
}

function compareText(a?: string, b?: string) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'zh-CN')
}

function getPostThumbnail(post: XhsPost): string | null {
  // Prefer local image
  if (post.local_images && post.local_images.length > 0) return post.local_images[0]
  // Fallback: proxy CDN URL
  const images = post.image_list?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  if (images.length > 0) return `/api/data/media-proxy?url=${encodeURIComponent(images[0])}`
  return null
}

export function XiaohongshuPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState<XhsPost | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('last_modify_ts')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const configDefaultsQuery = useQuery({
    queryKey: ['configDefaults'],
    queryFn: async () => {
      const { data } = await configApi.getDefaults()
      return data
    },
    staleTime: Infinity,
  })

  const saveOption = configDefaultsQuery.data?.save_option ?? 'db'
  const dbLabel: Record<string, string> = {
    sqlite: 'SQLite',
    db: 'MySQL',
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    mongodb: 'MongoDB',
  }
  const dbName = dbLabel[saveOption] ?? saveOption.toUpperCase()

  const dbPostsQuery = useQuery({
    queryKey: ['xhsPostsDb'],
    queryFn: async () => {
      const { data } = await dataApi.getXhsPostsFromDb(1000)
      return (data.data as Record<string, unknown>[]).filter(isXhsPost)
    },
  })

  const dbCommentsQuery = useQuery({
    queryKey: ['xhsCommentsDb'],
    queryFn: async () => {
      const { data } = await dataApi.getXhsCommentsFromDb(undefined, 10000)
      return (data.data as Record<string, unknown>[]).filter(isXhsComment)
    },
  })

  const posts = dbPostsQuery.data ?? []
  const comments = dbCommentsQuery.data ?? []
  const commentCountByNote = useMemo(() => {
    return comments.reduce<Record<string, number>>((counts, comment) => {
      counts[comment.note_id] = (counts[comment.note_id] ?? 0) + 1
      return counts
    }, {})
  }, [comments])
  const selectedComments = selectedPost
    ? comments.filter((comment) => comment.note_id === selectedPost.note_id)
    : []

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return posts

    return posts.filter((post) =>
      [post.title, post.desc, post.nickname, post.source_keyword, post.tag_list]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [posts, searchTerm])

  const sortedPosts = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1

    return [...filteredPosts].sort((a, b) => {
      let result = 0

      if (
        sortKey === 'liked_count' ||
        sortKey === 'collected_count' ||
        sortKey === 'comment_count'
      ) {
        const aValue =
          sortKey === 'comment_count'
            ? commentCountByNote[a.note_id] || metricValue(a.comment_count)
            : metricValue(a[sortKey])
        const bValue =
          sortKey === 'comment_count'
            ? commentCountByNote[b.note_id] || metricValue(b.comment_count)
            : metricValue(b[sortKey])
        result = aValue - bValue
      } else if (sortKey === 'last_modify_ts') {
        result = dateValue(a) - dateValue(b)
      } else {
        result = compareText(a[sortKey], b[sortKey])
      }

      return result * direction
    })
  }, [commentCountByNote, filteredPosts, sortDirection, sortKey])

  const pageCount = Math.max(1, Math.ceil(sortedPosts.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const totalLikes = useMemo(
    () => posts.reduce((total, post) => total + metricValue(post.liked_count), 0),
    [posts]
  )
  const totalComments = useMemo(
    () => comments.filter((comment) => !comment.parent_comment_id).length,
    [comments]
  )

  const isLoading = dbPostsQuery.isLoading || dbCommentsQuery.isLoading
  const isRefetching = dbPostsQuery.isRefetching || dbCommentsQuery.isRefetching
  const hasError = Boolean(dbPostsQuery.error || dbCommentsQuery.error)

  const handleRefresh = () => {
    dbPostsQuery.refetch()
    dbCommentsQuery.refetch()
  }

  const handleSort = (key: SortKey) => {
    setPage(1)
    if (sortKey === key) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDirection(
      key === 'title' || key === 'nickname' || key === 'source_keyword' ? 'asc' : 'desc'
    )
  }

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-3 h-3 opacity-50" />
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    )
  }

  const SortHeader = ({
    keyName,
    children,
    align = 'left',
  }: {
    keyName: SortKey
    children: string
    align?: 'left' | 'right'
  }) => (
    <button
      type="button"
      onClick={() => handleSort(keyName)}
      className={`inline-flex w-full items-center gap-1 hover:text-cyber-text-primary ${align === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      {children}
      {renderSortIcon(keyName)}
    </button>
  )

  return (
    <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
        <Card className="glass-panel float-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <Database className="w-8 h-8 text-cyber-neon-cyan" />
            <div>
              <div className="text-2xl font-mono font-bold text-cyber-text-primary">
                {posts.length}
              </div>
              <div className="text-xs text-cyber-text-muted font-mono">Captured notes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel float-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="w-8 h-8 text-cyber-neon-pink" />
            <div>
              <div className="text-2xl font-mono font-bold text-cyber-text-primary">
                {totalLikes}
              </div>
              <div className="text-xs text-cyber-text-muted font-mono">Total likes</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel float-panel">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-cyber-neon-green" />
            <div>
              <div className="text-2xl font-mono font-bold text-cyber-text-primary">
                {totalComments}
              </div>
              <div className="text-xs text-cyber-text-muted font-mono">Loaded comments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="flex-1 min-h-0 glass-panel float-panel rounded-lg overflow-hidden flex flex-col">
        <header className="px-4 py-3 border-b border-cyber-border-subtle flex items-center justify-between gap-4 bg-cyber-bg-tertiary/30">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-mono font-bold text-cyber-neon-cyan glow-text-cyan tracking-wider">
                Xiaohongshu
              </h1>
              <Badge variant="default">{dbName} DB</Badge>
            </div>
            <p className="text-xs text-cyber-text-muted mt-1 truncate">
              Reading from {dbName} Database (xhs_note)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-72 max-w-[40vw]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-text-muted" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setPage(1)
                }}
                placeholder="Search title, creator, tag..."
                className="pl-9 h-9 text-xs font-mono"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="font-mono text-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-cyber-text-muted font-mono animate-pulse">
            Loading Xiaohongshu data...
          </div>
        ) : hasError ? (
          <div className="flex-1 flex items-center justify-center text-cyber-neon-pink font-mono">
            Failed to load Xiaohongshu data
          </div>
        ) : posts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Database className="w-16 h-16 text-cyber-neon-cyan/30 mb-4" />
            <h2 className="text-lg font-mono font-semibold text-cyber-neon-cyan mb-2">
              No Xiaohongshu content yet
            </h2>
            <p className="text-sm text-cyber-text-muted max-w-md">
              Run an XHS crawler job with JSON/JSONL output and this page will read the generated
              files from data/xhs.
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-cyber-bg-tertiary border-b border-cyber-border-DEFAULT">
                  <tr className="font-mono text-xs text-cyber-neon-cyan">
                    <th className="px-4 py-3 text-left w-[34%]">
                      <SortHeader keyName="title">Post</SortHeader>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader keyName="nickname">Creator</SortHeader>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader keyName="source_keyword">Keyword</SortHeader>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortHeader keyName="liked_count" align="right">
                        Likes
                      </SortHeader>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortHeader keyName="collected_count" align="right">
                        Collects
                      </SortHeader>
                    </th>
                    <th className="px-4 py-3 text-right">
                      <SortHeader keyName="comment_count" align="right">
                        Comments
                      </SortHeader>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader keyName="last_modify_ts">Updated</SortHeader>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosts.map((post) => (
                    <tr
                      key={post.note_id}
                      onClick={() => setSelectedPost(post)}
                      className="border-b border-cyber-border-subtle hover:bg-cyber-neon-cyan/5 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          {(() => {
                            const thumb = getPostThumbnail(post)
                            return thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                className="w-12 h-12 rounded-md object-cover border border-cyber-border-subtle flex-shrink-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-cyber-bg-tertiary border border-cyber-border-subtle flex-shrink-0" />
                            )
                          })()}
                          <div className="min-w-0">
                            <div className="font-medium text-cyber-text-primary line-clamp-1 flex items-center gap-1.5">
                              {post.title_vi || post.title || 'Untitled note'}
                              {post.is_translated === 1 && (
                                <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-cyber-neon-green text-cyber-neon-green bg-cyber-neon-green/5">
                                  VI
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-cyber-text-muted mt-1 line-clamp-2">
                              {post.desc_vi || post.desc || post.note_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="text-cyber-text-primary">{post.nickname || '-'}</div>
                        <div className="text-[10px] text-cyber-text-muted font-mono">
                          {post.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {post.source_keyword ? (
                          <Badge variant="secondary">{post.source_keyword}</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-cyber-neon-pink align-top">
                        {post.liked_count || '0'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-cyber-neon-yellow align-top">
                        <span className="inline-flex items-center justify-end gap-1">
                          <Star className="w-3 h-3" />
                          {post.collected_count || '0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-cyber-neon-green align-top">
                        {commentCountByNote[post.note_id] || post.comment_count || '0'}
                      </td>
                      <td className="px-4 py-3 text-xs text-cyber-text-muted font-mono align-top whitespace-nowrap">
                        {formatXhsDate(post.last_modify_ts ?? post.time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>

            <footer className="flex items-center justify-between gap-3 px-4 py-3 border-t border-cyber-border-subtle bg-cyber-bg-tertiary/20">
              <div className="text-xs text-cyber-text-muted font-mono">
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, sortedPosts.length)} of {sortedPosts.length} posts
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => {
                    setPageSize(Number(val))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[110px] text-xs font-mono bg-cyber-bg-tertiary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-xs font-mono">
                        {size} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 font-mono text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-cyber-text-secondary font-mono px-2">
                  Page {currentPage} / {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                  disabled={currentPage === pageCount}
                  className="h-8 px-2 font-mono text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </footer>
          </>
        )}
      </section>

      <XiaohongshuPostDialog
        post={selectedPost}
        comments={selectedComments}
        open={Boolean(selectedPost)}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null)
        }}
      />
    </main>
  )
}
