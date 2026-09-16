import { AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { About } from './components/About'
import { CalloutDetail } from './components/CalloutDetail'
import { CalloutsFeed } from './components/CalloutsFeed'
import { ConfessionDetail } from './components/ConfessionDetail'
import { CrisisStrip } from './components/CrisisStrip'
import { HomeFeed } from './components/HomeFeed'
import { Insights } from './components/Insights'
import { LossCounter } from './components/LossCounter'
import { MoreScreen } from './components/MoreScreen'
import { MotionShell } from './components/MotionShell'
import { MyVoice } from './components/MyVoice'
import { Nav } from './components/Nav'
import { NumberFlash } from './components/NumberFlash'
import { PostConfession } from './components/PostConfession'
import { UnderstandUs } from './components/UnderstandUs'
import { useI18n } from './i18n'
import { I18nProvider } from './i18n/I18nProvider'
import { listCallouts } from './lib/callouts'
import { listConfessions, addHug } from './lib/confessions'
import type { Callout, Confession, ConfessionPublic, Screen } from './types'

function AppInner() {
  const { t } = useI18n()
  const [screen, setScreen] = useState<Screen>('home')
  const [confessions, setConfessions] = useState<ConfessionPublic[]>([])
  const [callouts, setCallouts] = useState<Callout[]>([])
  const [filter, setFilter] = useState('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [calloutId, setCalloutId] = useState<string | null>(null)
  const [flashNumber, setFlashNumber] = useState<number | null>(null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [flashKind, setFlashKind] = useState<'confession' | 'callout'>('confession')
  const [writePref, setWritePref] = useState<'confession' | 'comeback' | 'callout' | null>(null)
  const [showCrisisModal, setShowCrisisModal] = useState(false)

  const refresh = useCallback(async () => {
    const [c, o] = await Promise.all([listConfessions(), listCallouts()])
    setConfessions(c)
    setCallouts(o)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  function openDetail(id: string) {
    setDetailId(id)
    setCalloutId(null)
    setScreen('detail')
  }

  function openCallout(id: string) {
    setCalloutId(id)
    setDetailId(null)
    setScreen('calloutDetail')
  }

  function navigate(s: Screen) {
    if (s !== 'detail') setDetailId(null)
    if (s !== 'calloutDetail') setCalloutId(null)
    if (s !== 'post') setWritePref(null)
    setScreen(s)
  }

  function onPosted(c: Confession) {
    setFlashKind('confession')
    setFlashNumber(c.number)
    setFlashId(c.id)
    void refresh()
  }

  function onCalloutPosted(c: Callout) {
    setFlashKind('callout')
    setFlashNumber(c.number)
    setFlashId(c.id)
    void refresh()
  }

  const shellKey =
    screen === 'detail' && detailId
      ? `detail-${detailId}`
      : screen === 'calloutDetail' && calloutId
        ? `callout-${calloutId}`
        : screen

  return (
    <div className="app-shell">
      <CrisisStrip />
      <LossCounter />

      <AnimatePresence mode="wait">
        <MotionShell screenKey={shellKey}>
          {screen === 'home' ? (
            <HomeFeed
              confessions={confessions}
              filter={filter}
              onFilter={setFilter}
              onOpen={openDetail}
              onWrite={() => navigate('post')}
              onAbout={() => navigate('about')}
              onHug={async (id) => {
                await addHug(id)
                await refresh()
              }}
            />
          ) : null}
          {screen === 'callouts' ? (
            <CalloutsFeed
              callouts={callouts}
              onOpen={openCallout}
              onWrite={() => {
                setWritePref('callout')
                navigate('post')
              }}
            />
          ) : null}
          {screen === 'post' ? (
            <PostConfession
              initialKind={writePref ?? undefined}
              onPosted={onPosted}
              onCalloutPosted={onCalloutPosted}
              onCancel={() => navigate(writePref === 'callout' ? 'callouts' : 'home')}
              onCrisis={() => setShowCrisisModal(true)}
            />
          ) : null}
          {screen === 'detail' && detailId ? (
            <ConfessionDetail id={detailId} onBack={() => navigate('home')} onOpen={openDetail} />
          ) : null}
          {screen === 'calloutDetail' && calloutId ? (
            <CalloutDetail id={calloutId} onBack={() => navigate('callouts')} />
          ) : null}
          {screen === 'more' ? <MoreScreen onNavigate={navigate} /> : null}
          {screen === 'myvoice' ? <MyVoice onOpen={openDetail} /> : null}
          {screen === 'understand' ? <UnderstandUs onOpen={openDetail} /> : null}
          {screen === 'insights' ? <Insights confessions={confessions} /> : null}
          {screen === 'about' ? <About onBack={() => navigate('more')} /> : null}
        </MotionShell>
      </AnimatePresence>

      <Nav screen={screen} onNavigate={navigate} />

      {flashNumber != null && flashId ? (
        <NumberFlash
          number={flashNumber}
          kind={flashKind}
          onDone={() => {
            const id = flashId
            const kind = flashKind
            setFlashNumber(null)
            setFlashId(null)
            if (kind === 'callout') openCallout(id)
            else openDetail(id)
          }}
        />
      ) : null}

      {showCrisisModal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowCrisisModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crisis-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="crisis-title">{t.crisisModal.title}</h2>
            <p>{t.crisisModal.body}</p>
            <div className="help-actions" style={{ marginTop: '1rem' }}>
              <a className="btn btn-primary" href="tel:0800567567">
                {t.crisisModal.callSadag}
              </a>
              <a className="btn btn-soft" href="tel:10111">
                10111
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCrisisModal(false)}>
                {t.crisisModal.continue}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  )
}
