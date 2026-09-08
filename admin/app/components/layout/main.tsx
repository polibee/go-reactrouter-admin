import type React from 'react'
import { cn } from '~/lib/utils'

interface MainProps extends React.ComponentPropsWithRef<'main'> {
  fixed?: boolean
}

export const Main = ({ fixed, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'flex flex-col px-4 py-4 md:py-6 lg:px-6',
        fixed && 'fixed-main flex grow flex-col overflow-hidden',
      )}
      {...props}
    />
  )
}

Main.displayName = 'Main'
