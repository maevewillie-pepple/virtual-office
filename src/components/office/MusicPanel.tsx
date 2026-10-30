import { useEffect, useRef, useState } from 'react'
import type { OfficeMusicState, SpotifyContent } from '../../types'
import { fetchSpotifyTitle, loadSpotifyConnected, openSpotifyWindow, parseJamInvite, parseSpotifyContent, saveSpotifyConnected, SPOTIFY_EMBED_ALLOW, spotifyEmbedUrl, spotifyKindLabel, spotifyLoginUrl, spotifyOpenUrl } from '../../utils/spotify'
import { ChevronDown, ChevronUp, Copy, ExternalLink, Music, X } from 'lucide-react'
import Button from '../ui/Button'

interface MusicPanelProps {
  isOpen: boolean
  minimised: boolean
  onMinimisedChange: (minimised: boolean) => void
  onOpen: () => void
  onClose: () => void
  playerOpen: boolean
  onPlayerOpenChange: (open: boolean) => void
  personalPlaylist: SpotifyContent | null
  onPersonalPlaylistChange: (content: SpotifyContent | null) => void
  music: OfficeMusicState
  canEdit: boolean
  canManageJam: boolean
  hideNotifications: boolean
  onHideNotificationsChange: (hide: boolean) => void
  focusing: boolean
  onSaveContent: (content: SpotifyContent) => void
  onSaveJam: (url: string) => void
  onRemoveJam: () => void
  onRequestJam: () => void
}

export default function MusicPanel({
  isOpen, minimised, onMinimisedChange, onOpen, onClose,
  playerOpen, onPlayerOpenChange, personalPlaylist, onPersonalPlaylistChange,
  music, canEdit, canManageJam,
  hideNotifications, onHideNotificationsChange, focusing,
  onSaveContent, onSaveJam, onRemoveJam, onRequestJam,
}: MusicPanelProps) {
  const [playlistMode, setPlaylistMode] = useState(false)
  const [playOffice, setPlayOffice] = useState(false)
  const [playlistOpen, setPlaylistOpen] = useState(false)
  const [jamOpen, setJamOpen] = useState(false)
  const [playlistDraft, setPlaylistDraft] = useState('')
  const [jamDraft, setJamDraft] = useState('')
  const [playlistError, setPlaylistError] = useState('')
  const [jamError, setJamError] = useState('')
  const [preview, setPreview] = useState<SpotifyContent | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [embedReady, setEmbedReady] = useState(false)
  const [embedNonce, setEmbedNonce] = useState(0)
  const [connected, setConnected] = useState(loadSpotifyConnected)
  const [spotifyWindow, setSpotifyWindow] = useState<'signin' | 'jam' | null>(null)
  const [watchId, setWatchId] = useState(0)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [copied, setCopied] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const watch = useRef(0)

  const dismiss = () => {
    watch.current += 1
    popupRef.current?.close()
    popupRef.current = null
    setSpotifyWindow(null)
    onPlayerOpenChange(false)
    onMinimisedChange(false)
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onPlayerOpenChange, onMinimisedChange, onClose])

  useEffect(() => { setEmbedReady(false) }, [playOffice, personalPlaylist?.id, music.content?.id, embedNonce])

  useEffect(() => {
    if (!spotifyWindow) return
    const token = watchId
    const timer = window.setInterval(() => {
      if (watch.current !== token) return
      const popup = popupRef.current
      let closed = !popup
      try { closed = !popup || popup.closed } catch { closed = false }
      if (!closed) return
      window.clearInterval(timer)
      popupRef.current = null
      saveSpotifyConnected()
      setConnected(true)
      setSpotifyWindow(null)
      setEmbedNonce(n => n + 1)
    }, 400)
    return () => window.clearInterval(timer)
  }, [spotifyWindow, watchId])

  const jam = music.jam
  const playing = playOffice ? music.content ?? personalPlaylist : personalPlaylist ?? music.content
  const usingPersonal = !playOffice && !!personalPlaylist
  const widget = !isOpen && playerOpen
  const showEmbed = !!playing && (widget || playlistMode) && !minimised
  const embedHeight = playing?.kind === 'track' || widget ? 152 : 352

  if (!isOpen && !playerOpen) return null

  const dockPlayer = () => {
    onPlayerOpenChange(true)
    onMinimisedChange(false)
    onClose()
  }

  const previewPlaylist = async () => {
    const parsed = parseSpotifyContent(playlistDraft)
    if (!parsed) {
      setPreview(null)
      setPlaylistError('Paste a Spotify track, album, or playlist link from open.spotify.com.')
      return
    }
    setPlaylistError('')
    setPreviewing(true)
    const title = await fetchSpotifyTitle(parsed)
    setPreview(title ? { ...parsed, title } : parsed)
    setPreviewing(false)
  }

  const savePersonalPlaylist = () => {
    const parsed = preview ?? parseSpotifyContent(playlistDraft)
    if (!parsed) {
      setPlaylistError('Paste a Spotify track, album, or playlist link from open.spotify.com.')
      return
    }
    onPersonalPlaylistChange(parsed)
    setPlayOffice(false)
    setPlaylistDraft('')
    setPreview(null)
    setPlaylistOpen(false)
    setPlaylistMode(true)
    onPlayerOpenChange(true)
  }

  const saveJam = () => {
    const url = parseJamInvite(jamDraft)
    if (!url) {
      setJamError('Paste a Spotify Jam link. It looks like open.spotify.com/socialsession/… or spotify.link/…')
      return
    }
    onSaveJam(url)
    setJamDraft('')
    setJamError('')
    setJamOpen(false)
  }

  const openSpotify = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const openAttached = (url: string, purpose: 'signin' | 'jam') => {
    const popup = openSpotifyWindow(url)
    if (!popup || popup.closed) {
      setPopupBlocked(true)
      return
    }
    setPopupBlocked(false)
    const next = watch.current + 1
    watch.current = next
    setWatchId(next)
    popupRef.current = popup
    setSpotifyWindow(purpose)
    onPlayerOpenChange(true)
  }

  const signIn = () => {
    const returnTo = playing ? spotifyEmbedUrl(playing) : 'https://open.spotify.com'
    openAttached(spotifyLoginUrl(returnTo), 'signin')
  }

  const playJam = () => {
    if (!jam) return
    openAttached(jam.url, 'jam')
  }

  const copyJam = async () => {
    if (!jam) return
    try {
      await navigator.clipboard.writeText(jam.url)
      setCopied(true)
    } catch {
      setJamError('Could not copy from here. The invitation is still saved for the office.')
    }
  }

  const iconBtn = 'flex h-7 w-7 items-center justify-center rounded text-ink-3 hover:bg-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus'

  return (
    <section
      className={isOpen
        ? 'fixed bottom-20 left-4 z-40 w-[min(100vw-2rem,380px)] max-h-[calc(100vh-7.5rem)] overflow-y-auto rounded-xl border border-border bg-surface shadow-xl'
        : 'fixed bottom-20 left-4 z-40 w-[min(100vw-2rem,340px)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg'}
      aria-label="Office music"
    >
      <header className={`flex items-center justify-between gap-2 bg-surface ${isOpen ? 'sticky top-0 z-10 border-b border-border px-4 py-3' : 'px-3 py-2'}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-olive-soft text-olive">
            <Music size={14} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className={`font-semibold leading-none text-ink ${isOpen ? 'text-[15px]' : 'text-[13px]'}`}>Office music</p>
            {widget && (
              <p className="mt-1 truncate text-[12px] text-ink-2">
                {playing?.title ?? (playing ? spotifyKindLabel(playing.kind) : 'Your playlist')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(widget || playlistMode) && (
            <button
              type="button"
              onClick={() => widget ? onMinimisedChange(!minimised) : dockPlayer()}
              className={iconBtn}
              aria-label={minimised ? 'Show the music widget' : 'Dock the music widget'}
            >
              {minimised ? <ChevronUp size={15} strokeWidth={1.75} /> : <ChevronDown size={15} strokeWidth={1.75} />}
            </button>
          )}
          {widget && (
            <button type="button" onClick={onOpen} className={iconBtn} aria-label="Music options">
              <ChevronUp size={15} strokeWidth={1.75} />
            </button>
          )}
          <button type="button" onClick={dismiss} className={iconBtn} aria-label="Close music">
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {widget && showEmbed && playing && (
        <SpotifyFrame playing={playing} height={embedHeight} nonce={embedNonce} onReady={() => setEmbedReady(true)} />
      )}

      {widget && !minimised && !connected && (
        <div className="space-y-2 border-t border-border px-3 py-2.5">
          <SpotifyAccount
            connected={connected}
            waiting={spotifyWindow}
            blocked={popupBlocked}
            onSignIn={signIn}
          />
        </div>
      )}
      {widget && !minimised && connected && spotifyWindow === 'jam' && (
        <p className="border-t border-border px-3 py-2.5 text-[12px] leading-5 text-ink-2">
          The Jam is open in the Spotify window. This player stays on the office.
        </p>
      )}

      {isOpen && !minimised && (
        <div className="space-y-5 p-4">
          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold text-ink">Listen together</h3>
            {jam ? (
              <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                <p className="text-[13px] text-ink">A Jam is already going</p>
                <p className="text-[12px] text-ink-2">
                  Shared by {jam.sharedByName}
                  {jam.sharedAt ? ` · ${new Date(jam.sharedAt).toLocaleString()}` : ''}
                </p>
                <p className="text-[12px] leading-5 text-ink-2">
                  Play opens the Jam in a Spotify window. The office stays here. Listening together may need Spotify Premium.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={playJam}>Play Jam</Button>
                  <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={copyJam}>{copied ? 'Link copied' : 'Copy link'}</Button>
                </div>
                {canManageJam ? (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setJamOpen(v => !v)}>Replace invitation</Button>
                    <Button size="sm" variant="destructive" onClick={onRemoveJam}>Remove invitation</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={onRequestJam}>Ask for a new invitation</Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                <p className="text-[13px] text-ink">No Jam yet</p>
                <p className="text-[12px] leading-5 text-ink-2">
                  Start one in Spotify, then paste the invitation so the office can join.
                </p>
                <Button size="sm" onClick={() => setJamOpen(v => !v)}>Start a Jam</Button>
              </div>
            )}

            {jamOpen && (
              <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                <p className="text-[12px] leading-5 text-ink-2">
                  In Spotify, play something, choose Start a Jam, then Invite and copy the link. This office cannot create the Jam for you.
                </p>
                <Button size="sm" variant="ghost" onClick={() => openAttached('https://open.spotify.com', 'jam')}>
                  Open Spotify
                </Button>
                <label className="block text-[12px] text-ink-2" htmlFor="jam-url">Jam invitation</label>
                <input
                  id="jam-url"
                  value={jamDraft}
                  onChange={e => { setJamDraft(e.target.value); setJamError('') }}
                  placeholder="https://spotify.link/… or a socialsession link"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
                />
                {jamError && <p className="text-[12px] text-error">{jamError}</p>}
                <Button size="sm" onClick={saveJam}>Save invitation</Button>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-[13px] font-semibold text-ink">Play a playlist</h3>
            <p className="text-[12px] leading-5 text-ink-2">
              This plays on your Spotify account, on your own timeline. It leaves the Jam as it is.
            </p>
            {!playlistMode && (
              <Button size="sm" variant="secondary" onClick={() => { setPlaylistMode(true); onPlayerOpenChange(true) }}>
                Play a playlist
              </Button>
            )}

            {playlistMode && (
              <div className="space-y-2">
                {showEmbed && playing && (
                  <SpotifyFrame playing={playing} height={embedHeight} nonce={embedNonce} onReady={() => setEmbedReady(true)} />
                )}
                {!playing && (
                  <p className="text-[13px] text-ink">It's a little quiet in here.</p>
                )}
                {playing && (
                  <>
                    {!embedReady && <p className="text-[12px] text-ink-2">Loading the Spotify player…</p>}
                    <p className="text-[13px] text-ink">{playing.title ?? spotifyKindLabel(playing.kind)}</p>
                    <p className="text-[12px] leading-5 text-ink-2">
                      {usingPersonal ? 'Your playlist, saved on this browser.' : `Office playlist${music.updatedByName ? `, chosen by ${music.updatedByName}` : ''}.`}
                    </p>
                  </>
                )}
                <SpotifyAccount
                  connected={connected}
                  waiting={spotifyWindow}
                  blocked={popupBlocked}
                  onSignIn={signIn}
                />
                <div className="flex flex-wrap gap-2">
                  {connected && (
                    <Button size="sm" variant="ghost" onClick={signIn}>Sign in again</Button>
                  )}
                  {playing && (
                    <Button size="sm" variant="secondary" icon={<ExternalLink size={13} />} onClick={() => openSpotify(spotifyOpenUrl(playing))}>
                      Open in Spotify
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setPlaylistOpen(v => !v)}>
                    {personalPlaylist ? 'Change my playlist' : 'Use my playlist'}
                  </Button>
                  {music.content && (
                    <Button size="sm" variant="ghost" onClick={() => { setPlayOffice(v => !v); setPlaylistMode(true) }}>
                      {playOffice ? 'Play my playlist' : 'Play the office playlist'}
                    </Button>
                  )}
                  {playing && canEdit && usingPersonal && (
                    <Button size="sm" variant="ghost" onClick={() => onSaveContent(playing)}>Share with the office</Button>
                  )}
                </div>
                {playlistOpen && (
                  <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                    <label className="block text-[12px] text-ink-2" htmlFor="spotify-url">Your Spotify link</label>
                    <input
                      id="spotify-url"
                      value={playlistDraft}
                      onChange={e => { setPlaylistDraft(e.target.value); setPlaylistError(''); setPreview(null) }}
                      placeholder="https://open.spotify.com/playlist/…"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive/30"
                    />
                    {playlistError && <p className="text-[12px] text-error">{playlistError}</p>}
                    {preview && (
                      <p className="text-[12px] text-ink">
                        {spotifyKindLabel(preview.kind)}{preview.title ? ` · ${preview.title}` : ''}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={previewPlaylist} loading={previewing}>Check link</Button>
                      <Button size="sm" onClick={savePersonalPlaylist}>Save</Button>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={dockPlayer}
                  className="text-[13px] text-ink-2 underline-offset-2 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Keep the player on screen
                </button>
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-[13px] font-semibold text-ink">Music settings</h3>
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={hideNotifications}
                onChange={e => onHideNotificationsChange(e.target.checked)}
                className="accent-olive"
              />
              Hide music notifications
            </label>
            {focusing && (
              <p className="text-[12px] text-ink-3">Music notifications stay quiet during a focus session. Your Spotify playback is left as it is.</p>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

function SpotifyAccount({
  connected, waiting, blocked, onSignIn,
}: {
  connected: boolean
  waiting: 'signin' | 'jam' | null
  blocked: boolean
  onSignIn: () => void
}) {
  if (waiting === 'signin') {
    return <p className="text-[12px] leading-5 text-ink-2">The Spotify window is open. Sign in there, then close it. This player stays on the office.</p>
  }
  if (waiting === 'jam') {
    return <p className="text-[12px] leading-5 text-ink-2">The Jam is open in the Spotify window. Close it when you are done, and this player keeps the same sign-in.</p>
  }
  if (blocked) {
    return (
      <div className="space-y-2">
        <p className="text-[12px] leading-5 text-ink-2">The browser blocked the Spotify window. Allow popups for this office, then try again.</p>
        <Button size="sm" onClick={onSignIn}>Try again</Button>
      </div>
    )
  }
  if (connected) return null
  return (
    <div className="space-y-2">
      <p className="text-[12px] leading-5 text-ink-2">Sign in once. A Spotify window opens over the office, and this player keeps the session.</p>
      <Button size="sm" onClick={onSignIn}>Sign in to Spotify</Button>
    </div>
  )
}

function SpotifyFrame({
  playing, height, nonce, onReady,
}: {
  playing: SpotifyContent
  height: number
  nonce: number
  onReady: () => void
}) {
  return (
    <iframe
      key={`${playing.kind}-${playing.id}-${nonce}`}
      title={playing.title ? `Spotify embed: ${playing.title}` : 'Spotify embed'}
      src={spotifyEmbedUrl(playing)}
      width="100%"
      height={height}
      style={{ border: 0, width: '100%', height, display: 'block' }}
      allow={SPOTIFY_EMBED_ALLOW}
      onLoad={onReady}
      className="bg-muted"
    />
  )
}
