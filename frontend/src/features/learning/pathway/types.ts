export type PathwayNodeStatus = 'locked' | 'current' | 'completed'

export interface PathwayNodeData {
  id: string
  title: string
  status: PathwayNodeStatus
  isEvaluation: boolean
  isLesson: boolean
  color: string
  shadowColor: string
}

export interface PathwayModuleData {
  id: number
  title: string
  color: string
  shadowColor: string
  icon: string
  nodes: PathwayNodeData[]
  progressPercentage: number
}
