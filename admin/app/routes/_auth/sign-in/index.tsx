import { parseSubmission, report } from '@conform-to/react/future'
import { href } from 'react-router'
import { redirectWithSuccess } from 'remix-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { ApiError } from '~/core/api/errors'
import { authService } from '~/core/auth'
import { UserAuthForm } from './+components/user-auth-form'
import { formSchema } from './+schema'
import type { Route } from './+types/index'

export const action = async ({ request }: Route.ActionArgs) => {
  const submission = parseSubmission(await request.formData())
  const result = formSchema.safeParse(submission.payload)

  if (!result.success) {
    return {
      result: report(submission, { error: { issues: result.error.issues } }),
    }
  }

  try {
    await authService.login(result.data)
  } catch (error) {
    return {
      result: report(submission, {
        error: {
          formErrors: [
            error instanceof ApiError
              ? error.message
              : 'Unable to reach the authentication service',
          ],
        },
      }),
    }
  }

  throw await redirectWithSuccess(href('/'), {
    message: 'You have successfully logged in!',
  })
}

export default function SignIn() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Login
        </CardTitle>
        <CardDescription>
          Enter your email and password below <br />
          to log into your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserAuthForm />
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-center text-sm">
          By clicking login, you agree to our{' '}
          <a
            href="/terms"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}
