'use client'

import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'

interface AIVerificationStepsProps {
  steps: { label: string; done: boolean; active: boolean }[]
}

export default function AIVerificationSteps({ steps }: AIVerificationStepsProps) {
  return (
    <div className="space-y-4 my-6">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-3">
          {step.done ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : step.active ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <CircleDashed className="w-5 h-5 text-gray-300" />
          )}
          <span
            className={`${
              step.done
                ? 'text-green-700 font-medium'
                : step.active
                ? 'text-blue-700 font-medium'
                : 'text-gray-400'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
