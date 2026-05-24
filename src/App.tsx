import { useState } from 'react'
import type { Output, RoleModel, UpcomingPerson } from '@/lib/types'
import { GrowthHome } from '@/components/growth/GrowthHome'
import { AddOutputModal } from '@/components/growth/AddOutputModal'
import { OutputDetailModal } from '@/components/growth/OutputDetailModal'
import { AllOutputsModal } from '@/components/growth/AllOutputsModal'
import { AddRoleModelModal } from '@/components/growth/AddRoleModelModal'
import { RoleModelDetailModal } from '@/components/growth/RoleModelDetailModal'
import { QuestionsModal } from '@/components/growth/QuestionsModal'
import { RequestReviewModal } from '@/components/growth/RequestReviewModal'
import { WeeklyReviewModal } from '@/components/growth/WeeklyReviewModal'
import { AddInputModal } from '@/components/growth/AddInputModal'
import { AddUpcomingPersonModal } from '@/components/growth/AddUpcomingPersonModal'
import { useGrowthStore } from '@/stores/growth-store'

function App() {
  const outputs = useGrowthStore((s) => s.outputs)
  const upcomingPeople = useGrowthStore((s) => s.upcomingPeople)

  const [addOutputOpen, setAddOutputOpen] = useState(false)
  const [requestReviewOpen, setRequestReviewOpen] = useState(false)
  const [allOutputsOpen, setAllOutputsOpen] = useState(false)
  const [selectedOutput, setSelectedOutput] = useState<Output | null>(null)
  const [addRoleModelOpen, setAddRoleModelOpen] = useState(false)
  const [selectedRoleModel, setSelectedRoleModel] = useState<RoleModel | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<UpcomingPerson | null>(null)
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false)
  const [addInputOpen, setAddInputOpen] = useState(false)
  const [addPersonOpen, setAddPersonOpen] = useState(false)

  const freshSelectedPerson = selectedPerson
    ? upcomingPeople.find((p) => p.id === selectedPerson.id) ?? null
    : null

  return (
    <>
      <GrowthHome
        onAddOutput={() => setAddOutputOpen(true)}
        onRequestReview={() => setRequestReviewOpen(true)}
        onViewAllOutputs={() => setAllOutputsOpen(true)}
        onSelectOutput={(o) => setSelectedOutput(o)}
        onSelectRoleModel={(rm) => setSelectedRoleModel(rm)}
        onAddRoleModel={() => setAddRoleModelOpen(true)}
        onSelectPerson={(p) => setSelectedPerson(p)}
        onAddPerson={() => setAddPersonOpen(true)}
        onAddInput={() => setAddInputOpen(true)}
        onWeeklyReview={() => setWeeklyReviewOpen(true)}
      />

      <AddOutputModal open={addOutputOpen} onClose={() => setAddOutputOpen(false)} />
      <RequestReviewModal open={requestReviewOpen} onClose={() => setRequestReviewOpen(false)} />
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
      <WeeklyReviewModal open={weeklyReviewOpen} onClose={() => setWeeklyReviewOpen(false)} />
      <AddInputModal open={addInputOpen} onClose={() => setAddInputOpen(false)} />
      <AddUpcomingPersonModal open={addPersonOpen} onClose={() => setAddPersonOpen(false)} />
    </>
  )
}

export default App
