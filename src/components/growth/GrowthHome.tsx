import { useMemo, useRef } from 'react'
import type { Output, RoleModel, UpcomingPerson } from '@/lib/types'
import { peerScoredCount } from '@/lib/utils'
import { WeeklySummary } from './WeeklySummary'
import { WeeklyGoalsDisplay } from './WeeklyGoalsDisplay'
import { TodayActions } from './TodayActions'
import { GrowthCycleSection } from './GrowthCycleSection'
import { RecordsSection } from './RecordsSection'
import { RoleModelsSection } from './RoleModelsSection'
import { UpcomingPeopleSection } from './UpcomingPeopleSection'
import { WeeklyReviewButton } from './WeeklyReviewButton'
import { NextActionPlanSection } from './NextActionPlanSection'
import { useGrowthStore } from '@/stores/growth-store'
import { SampleControls } from '@/components/SampleControls'

interface GrowthHomeProps {
  onAddOutput: () => void
  onRequestReview: (outputId: string) => void
  onSelfScore: () => void
  onEnterFeedback: () => void
  onSelectOutput: (output: Output) => void
  onSelectRoleModel: (rm: RoleModel) => void
  onAddRoleModel: () => void
  onSelectPerson: (person: UpcomingPerson) => void
  onAddPerson: () => void
  onAddInput: () => void
  onWeeklyReview: () => void
  onOutputFromInput: (inputId: string) => void
  onNextActionPlan?: () => void
}

export function GrowthHome({
  onAddOutput,
  onRequestReview,
  onSelfScore,
  onEnterFeedback,
  onSelectOutput,
  onSelectRoleModel,
  onAddRoleModel,
  onSelectPerson,
  onAddPerson,
  onAddInput,
  onWeeklyReview,
  onOutputFromInput,
}: GrowthHomeProps) {
  const { outputs, roleModels, upcomingPeople, inputs } = useGrowthStore()
  const nextActionRef = useRef<HTMLElement | null>(null)

  const handleNextActionPlan = () => {
    setTimeout(() => {
      nextActionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const selfScoredTotal = useMemo(() => outputs.filter((o) => o.self_score > 0).length, [outputs])
  const peerCount = useMemo(() => peerScoredCount(outputs), [outputs])

  const metPeople = upcomingPeople.filter((p) => p.met)
  const totalQuestions = upcomingPeople.reduce((sum, p) => sum + p.questions.length, 0)

  const hasData = outputs.length > 0 || inputs.length > 0 || roleModels.length > 0 || upcomingPeople.length > 0

  return (
    <div className="pb-6">
      <SampleControls feature="growth" hasData={hasData} accent="#185FA5" />
      <WeeklySummary
        inputCount={inputs.length}
        outputCount={outputs.length}
        selfScoredCount={selfScoredTotal}
        peerScoredCount={peerCount}
      />
      <WeeklyGoalsDisplay />
      <TodayActions onAddOutput={onAddOutput} onAddInput={onAddInput} onSelfScore={onSelfScore} onEnterFeedback={onEnterFeedback} onNextActionPlan={handleNextActionPlan} />
      <GrowthCycleSection />
      <NextActionPlanSection sectionRef={nextActionRef} />
      <RecordsSection inputs={inputs} outputs={outputs} onSelectOutput={onSelectOutput} onOutputFromInput={onOutputFromInput} onRequestReview={onRequestReview} />
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
      <WeeklyReviewButton onPress={onWeeklyReview} />
    </div>
  )
}
