import { useMemo } from 'react'
import type { Output, RoleModel, UpcomingPerson } from '@/lib/types'
import {
  weeklyOutputs,
  lastWeekOutputs,
  averageSelfScore,
  peerScoredCount,
} from '@/lib/utils'
import { GrowthHeader } from './GrowthHeader'
import { WeeklySummary } from './WeeklySummary'
import { TodayActions } from './TodayActions'
import { RoleModelsSection } from './RoleModelsSection'
import { UpcomingPeopleSection } from './UpcomingPeopleSection'
import { RecordsSection } from './RecordsSection'
import { GrowthCycleSection } from './GrowthCycleSection'
import { DataManagementSection } from './DataManagementSection'
import { WeeklyReviewButton } from './WeeklyReviewButton'
import { useGrowthStore } from '@/stores/growth-store'

interface GrowthHomeProps {
  onAddOutput: () => void
  onRequestReview: () => void
  onSelfScore: () => void
  onSelectOutput: (output: Output) => void
  onSelectRoleModel: (rm: RoleModel) => void
  onAddRoleModel: () => void
  onSelectPerson: (person: UpcomingPerson) => void
  onAddPerson: () => void
  onAddInput: () => void
  onWeeklyReview: () => void
}

export function GrowthHome({
  onAddOutput,
  onRequestReview,
  onSelfScore,
  onSelectOutput,
  onSelectRoleModel,
  onAddRoleModel,
  onSelectPerson,
  onAddPerson,
  onAddInput,
  onWeeklyReview,
}: GrowthHomeProps) {
  const { outputs, roleModels, upcomingPeople, inputs } = useGrowthStore()

  const weekly = useMemo(() => weeklyOutputs(outputs), [outputs])
  const lastWeek = useMemo(() => lastWeekOutputs(outputs), [outputs])
  const avgScore = useMemo(() => averageSelfScore(weekly), [weekly])
  const peerCount = useMemo(() => peerScoredCount(weekly), [weekly])

  const metPeople = upcomingPeople.filter((p) => p.met)
  const totalQuestions = upcomingPeople.reduce((sum, p) => sum + p.questions.length, 0)

  const progressScore = Math.min(10, Math.round(weekly.length * 0.8 + peerCount * 0.5))

  return (
    <div className="pb-6">
      <GrowthHeader score={progressScore} maxScore={10} />
      <WeeklySummary
        outputCount={weekly.length}
        lastWeekOutputCount={lastWeek.length}
        avgSelfScore={avgScore}
        peerScoredCount={peerCount}
      />
      <TodayActions onAddOutput={onAddOutput} onRequestReview={onRequestReview} onAddInput={onAddInput} onSelfScore={onSelfScore} />
      <RecordsSection inputs={inputs} outputs={outputs} onSelectOutput={onSelectOutput} />
      <RoleModelsSection
        roleModels={roleModels}
        onSelect={onSelectRoleModel}
        onAdd={onAddRoleModel}
      />
      <UpcomingPeopleSection
        people={upcomingPeople}
        metCount={metPeople.length}
        totalQuestions={totalQuestions}
        onSelect={onSelectPerson}
        onAdd={onAddPerson}
      />
      <GrowthCycleSection />
      <DataManagementSection />
      <WeeklyReviewButton onPress={onWeeklyReview} />
    </div>
  )
}
