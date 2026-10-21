import { useEffect, useState } from "react"
import type { ConversationScene } from "@/agent-ui/immersive/contracts"

const completedScenes = new Set<string>()

/** Play new demo turns progressively; historical conversations remain complete. */
export function useDemoPlayback(scene: ConversationScene) {
  const lastTurn = scene.turns.at(-1)
  const total = lastTurn?.execution.steps.length ?? 0
  const animate = /\d{13}/.test(scene.id) && !completedScenes.has(scene.id)
  const [state, setState] = useState({ id: scene.id, progress: animate ? 0 : total })
  const progress = state.id === scene.id ? state.progress : (animate ? 0 : total)

  useEffect(() => {
    if (progress >= total) {
      completedScenes.add(scene.id)
      return
    }
    if (!animate) return
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800
    const timer = window.setTimeout(() => setState({ id: scene.id, progress: progress + 1 }), delay)
    return () => window.clearTimeout(timer)
  }, [animate, progress, total, scene.id])

  const running = animate && progress < total
  if (!running || !lastTurn) return { scene, running: false }
  const streaming: ConversationScene = {
    ...scene,
    turns: scene.turns.map((turn, index) => index < scene.turns.length - 1 ? turn : {
      ...turn,
      assistant: undefined,
      productBlock: undefined,
      execution: {
        ...turn.execution, status: "running", summary: turn.execution.steps[progress]?.title ?? "正在整理结果", duration: "执行中",
        steps: turn.execution.steps.map((step, stepIndex) => ({ ...step, status: stepIndex < progress ? "completed" : stepIndex === progress ? "running" : "pending", actions: stepIndex < progress ? step.actions : undefined })),
      },
    }),
  }
  return { scene: streaming, running }
}
