import { AuthForm } from './AuthForm'
import { BackgroundBlobs } from '@/components/layout/BackgroundBlobs'

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <BackgroundBlobs />
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <AuthForm />
      </div>
    </div>
  )
}
