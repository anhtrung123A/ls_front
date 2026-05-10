import type { ReactNode } from 'react'

type AuthCardLayoutProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthCardLayout({ title, subtitle, children }: AuthCardLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Email sign in step">
        <div className="left-panel">
          <div className="logo" aria-hidden="true">
            G
          </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <div className="right-panel">{children}</div>
      </section>
    </main>
  )
}
