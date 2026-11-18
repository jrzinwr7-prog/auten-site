import { homeExercises as ex } from '../data/exercises'
import type { PlanSession, Profile } from './types'

const lowerA: PlanSession = { id: 'lower-a', code: 'INF A', title: 'Inferiores A', focus: 'Coxas + panturrilhas', estimatedMinutes: 38, exercises: [ex.squat, ex.bulgarian, ex.calf, ex.bridge, ex.plank] }
const upperA: PlanSession = { id: 'upper-a', code: 'SUP A', title: 'Superiores A', focus: 'Peito + costas + core', estimatedMinutes: 40, exercises: [ex.pushup, ex.backpackRow, ex.pike, ex.curlBag, ex.deadBug] }
const lowerB: PlanSession = { id: 'lower-b', code: 'INF B', title: 'Inferiores B', focus: 'Posterior + estabilidade', estimatedMinutes: 39, exercises: [ex.lunge, ex.curl, ex.bridge, ex.calf, ex.sidePlank] }
const upperB: PlanSession = { id: 'upper-b', code: 'SUP B', title: 'Superiores B', focus: 'Braços + costas + core', estimatedMinutes: 40, exercises: [ex.diamond, ex.tableRow, ex.dip, ex.ytw, ex.legRaise] }
const fullBody: PlanSession = { id: 'full-body', code: 'FULL', title: 'Corpo todo', focus: 'Base de força', estimatedMinutes: 38, exercises: [ex.squat, ex.pushup, ex.backpackRow, ex.bridge, ex.plank] }

export function generateTrainingPlan(profile: Profile): PlanSession[] {
  if (profile.daysPerWeek <= 2) return [fullBody, { ...fullBody, id: 'full-body-b', code: 'FULL B', title: 'Corpo todo B', exercises: [ex.lunge, ex.pike, ex.backpackRow, ex.curl, ex.deadBug] }]
  if (profile.daysPerWeek === 3) return [lowerA, upperA, fullBody]
  return [lowerA, upperA, lowerB, upperB].slice(0, Math.min(profile.daysPerWeek, 4))
}
