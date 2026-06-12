import { useState, useRef } from 'react'
import type { Output, RoleModel, UpcomingPerson } from '@/lib/types'
import { GrowthHome } from '@/components/growth/GrowthHome'
import { AddOutputModal } from '@/components/growth/AddOutputModal'
import { OutputDetailModal } from '@/components/growth/OutputDetailModal'
import { AllOutputsModal } from '@/components/growth/AllOutputsModal'
import { AddRoleModelModal } from '@/components/growth/AddRoleModelModal'
import { RoleModelDetailModal } from '@/components/growth/RoleModelDetailModal'
import { QuestionsModal } from '@/components/growth/QuestionsModal'
import { FeedbackModal } from '@/components/growth/FeedbackModal'
import { AddInputModal } from '@/components/growth/AddInputModal'
import { AddUpcomingPersonModal } from '@/components/growth/AddUpcomingPersonModal'
import { SelfScoreModal } from '@/components/growth/SelfScoreModal'
import { DiscoveryWrapper } from '@/discovery/DiscoveryWrapper'
import { BekkaiHome } from '@/components/bekkai/BekkaiHome'
import { FailurePowerHome } from '@/components/growth/FailurePowerHome'
import { RealizationPowerHome } from '@/components/growth/RealizationPowerHome'
import { GrowthDashboard } from '@/components/growth/GrowthDashboard'
import { DataHome } from '@/components/data/DataHome'
import { AppHeader } from '@/components/AppHeader'
import type { AppTab } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { HomeScreen } from '@/components/HomeScreen'
import { AboutScreen } from '@/components/AboutScreen'
import { FeatureGuide, isGuideHidden } from '@/components/FeatureGuide'
import type { GuideFeature } from '@/components/FeatureGuide'
import { OnboardingModal, isOnboarded, shouldAutoShowOnboarding, registerLaunch } from '@/components/OnboardingModal'
import { Toaster } from '@/components/Toaster'
import { QuickCapture } from '@/components/QuickCapture'
import { Celebration } from '@/components/Celebration'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'

function App() {
  const outputs = useGrowthStore((s) => s.outputs)
  const upcomingPeople = useGrowthStore((s) => s.upcomingPeople)
  const inputs = useGrowthStore((s) => s.inputs)
  const roleModels = useGrowthStore((s) => s.roleModels)
  const failurePower = useGrowthStore((s) => s.failurePower)
  const realizationPower = useGrowthStore((s) => s.realizationPower)
  const bekkais = useBekkaiStore((s) => s.bekkais)
  const entries = useEntriesStore((s: { entries: Record<string, unknown[]> }) => s.entries)

  // 各機能が「未入力」か（ガイド自動表示の条件）
  const isFeatureEmpty = (tab: AppTab): boolean => {
    if (tab === 'growth') return outputs.length === 0 && inputs.length === 0 && roleModels.length === 0 && upcomingPeople.length === 0
    if (tab === 'bekkai') return bekkais.length === 0
    if (tab === 'discovery') return Object.values(entries ?? {}).every((v) => !Array.isArray(v) || v.length === 0)
    if (tab === 'failure') return !failurePower || Object.values(failurePower).every((v) => !Array.isArray(v) || v.length === 0)
    if (tab === 'realization') return !realizationPower || Object.values(realizationPower).every((v) => !Array.isArray(v) || v.length === 0)
    return false // data タブにガイドなし
  }

  const NON_GUIDE: AppTab[] = ['home', 'dashboard', 'data', 'about']
  const shownThisSession = useRef<Set<AppTab>>(new Set())
  // 全体オンボーディングを見た後は各機能ガイドを自動表示しない（モーダル疲れ防止）。
  // 使い方はヘッダーの「？」からいつでも開ける。
  const shouldAutoShow = (tab: AppTab) =>
    !isOnboarded() && !NON_GUIDE.includes(tab) && isFeatureEmpty(tab) && !isGuideHidden(tab as GuideFeature) && !shownThisSession.current.has(tab)

  const [activeTab, setActiveTab] = useState<AppTab>('home')
  // 使い方の自動表示：最初の数回 or バージョン更新時のみ（手動オフは尊重）
  const [onboardingOpen, setOnboardingOpen] = useState(() => { const show = shouldAutoShowOnboarding(); registerLaunch(); return show })
  const [guideOpen, setGuideOpen] = useState(false)

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab)
    if (shouldAutoShow(tab)) { shownThisSession.current.add(tab); setGuideOpen(true) }
  }
  const closeGuide = () => setGuideOpen(false)

  const [addOutputOpen, setAddOutputOpen] = useState(false)
  const [linkedInputId, setLinkedInputId] = useState<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTab, setFeedbackTab] = useState<'request' | 'enter'>('request')
  const [feedbackOutputId, setFeedbackOutputId] = useState<string | null>(null)
  const [allOutputsOpen, setAllOutputsOpen] = useState(false)
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null)
  const [addRoleModelOpen, setAddRoleModelOpen] = useState(false)
  const [selectedRoleModel, setSelectedRoleModel] = useState<RoleModel | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<UpcomingPerson | null>(null)
  const [addInputOpen, setAddInputOpen] = useState(false)
  const [deepenOpen, setDeepenOpen] = useState(false)
  const [deepenInitial, setDeepenInitial] = useState<{ type?: 'dialogue'; title?: string; learning?: string } | undefined>(undefined)
  const openDeepenInput = (question: string) => {
    setDeepenInitial({ type: 'dialogue', title: '', learning: `今日の問い: ${question}` })
    setDeepenOpen(true)
  }
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [selfScoreOpen, setSelfScoreOpen] = useState(false)

  const freshSelectedPerson = selectedPerson
    ? upcomingPeople.find((p) => p.id === selectedPerson.id) ?? null
    : null

  const handleOutputFromInput = (inputId: string) => {
    setLinkedInputId(inputId)
    setAddOutputOpen(true)
  }

  const handleAddOutputClose = () => {
    setAddOutputOpen(false)
    setLinkedInputId(null)
  }

  return (
    <>
      <AppHeader activeTab={activeTab} onTabChange={handleTabChange} onHelp={NON_GUIDE.includes(activeTab) ? () => setOnboardingOpen(true) : () => setGuideOpen(true)} />
      {!NON_GUIDE.includes(activeTab) && <FeatureGuide feature={activeTab as GuideFeature} open={guideOpen} onClose={closeGuide} />}
      <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />

      <main style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 108px)' }}>
      {activeTab === 'home' && <HomeScreen onNavigate={handleTabChange} onDeepenInput={openDeepenInput} />}
      <AddInputModal open={deepenOpen} onClose={() => setDeepenOpen(false)} initial={deepenInitial} />

      {activeTab === 'about' && <AboutScreen onStart={() => handleTabChange('home')} onBack={() => handleTabChange('home')} />}

      {activeTab === 'growth' && (
        <>
          <GrowthHome
            onAddOutput={() => setAddOutputOpen(true)}
            onRequestReview={(outputId: string) => { setFeedbackOutputId(outputId); setFeedbackTab('request'); setFeedbackOpen(true) }}
            onSelfScore={() => setSelfScoreOpen(true)}
            onEnterFeedback={() => { setFeedbackOutputId(null); setFeedbackTab('request'); setFeedbackOpen(true) }}
            onSelectOutput={(o) => setSelectedOutput(o)}
            onSelectRoleModel={(rm) => setSelectedRoleModel(rm)}
            onAddRoleModel={() => setAddRoleModelOpen(true)}
            onSelectPerson={(p) => setSelectedPerson(p)}
            onAddPerson={() => setAddPersonOpen(true)}
            onAddInput={() => setAddInputOpen(true)}
            onOutputFromInput={handleOutputFromInput}
          />

          <AddOutputModal
            open={addOutputOpen}
            onClose={handleAddOutputClose}
            initialLinkedInputId={linkedInputId}
          />
          <FeedbackModal
            open={feedbackOpen}
            initialTab={feedbackTab}
            initialOutputId={feedbackOutputId ?? undefined}
            onClose={() => { setFeedbackOpen(false); setFeedbackOutputId(null) }}
          />
          <AllOutputsModal
            open={allOutputsOpen}
            onClose={() => setAllOutputsOpen(false)}
            outputs={outputs}
            onSelect={(o) => setSelectedOutput(o)}
          />
          <OutputDetailModal
            open={selectedOutput !== null}
            onClose={() => setSelectedOutput(null)}
            output={selectedOutput}
          />
          <AddRoleModelModal open={addRoleModelOpen} onClose={() => setAddRoleModelOpen(false)} />
          <RoleModelDetailModal
            open={selectedRoleModel !== null}
            onClose={() => setSelectedRoleModel(null)}
            roleModel={selectedRoleModel}
          />
          <QuestionsModal
            open={freshSelectedPerson !== null}
            onClose={() => setSelectedPerson(null)}
            person={freshSelectedPerson}
          />
          <AddInputModal open={addInputOpen} onClose={() => setAddInputOpen(false)} />
          <AddUpcomingPersonModal open={addPersonOpen} onClose={() => setAddPersonOpen(false)} />
          <SelfScoreModal open={selfScoreOpen} onClose={() => setSelfScoreOpen(false)} />
        </>
      )}

      {activeTab === 'discovery' && <DiscoveryWrapper />}

      {activeTab === 'bekkai' && <BekkaiHome onNavigate={handleTabChange} />}

      {activeTab === 'realization' && <RealizationPowerHome />}

      {activeTab === 'failure' && <FailurePowerHome />}

      {activeTab === 'dashboard' && <GrowthDashboard />}

      {activeTab === 'data' && <DataHome />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      {!['data', 'about'].includes(activeTab) && <QuickCapture />}
      <Celebration />
      <Toaster />
    </>
  )
}

export default App
