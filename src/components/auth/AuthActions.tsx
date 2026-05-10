type AuthActionsProps = {
  isLoading: boolean
  isDisabled: boolean
}

export function AuthActions({ isLoading, isDisabled }: AuthActionsProps) {
  return (
    <div className="actions">
      <button type="button" className="text-action">
        Create account
      </button>
      <button type="submit" className="primary-action" disabled={isDisabled}>
        {isLoading ? 'Checking...' : 'Next'}
      </button>
    </div>
  )
}
