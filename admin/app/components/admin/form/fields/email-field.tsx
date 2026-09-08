import { Mail } from 'lucide-react'
import type { TextFieldProps } from './text-field'
import { TextField } from './text-field'

export function EmailField(props: Omit<TextFieldProps, 'leftIcon'>) {
  return (
    <TextField
      leftIcon={Mail}
      placeholder={props.placeholder || 'example@domain.com'}
      {...props}
    />
  )
}
