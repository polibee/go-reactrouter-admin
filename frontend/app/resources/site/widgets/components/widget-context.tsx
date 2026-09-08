import { createContext, useContext } from 'react'

export interface WidgetContextValue {
  density: 'compact' | 'standard'
  showCardDividers: boolean
}

export const WidgetContext = createContext<WidgetContextValue>({
  density: 'compact',
  showCardDividers: true,
})

export function useWidgetContext() {
  return useContext(WidgetContext)
}
