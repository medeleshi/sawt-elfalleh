/**
 * Visual divider between OAuth and email/password sections.
 */
export default function AuthDivider() {
  return (
    <div className="relative my-5 flex items-center">
      <div className="flex-1 border-t border-border" />
      <span className="mx-3 text-xs text-muted-foreground">أو</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}
