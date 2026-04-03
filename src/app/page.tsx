import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-foreground mb-4">
          Study<span className="text-primary">Board</span>
        </h1>
        <p className="text-xl text-muted mb-8">
          Keep all your school assignments organized, track deadlines, manage
          your classes, and stay on top of your grades.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-surface text-foreground font-medium border border-border hover:bg-surface-hover transition-colors"
          >
            Sign In
          </Link>
        </div>

        <p className="text-xs text-muted mt-3">
          <Link href="/dashboard" className="hover:text-foreground underline">
            or continue without an account
          </Link>
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Kanban Board</h3>
            <p className="text-sm text-muted">
              Drag assignments through To Do, In Progress, and Done columns.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">AI Upload</h3>
            <p className="text-sm text-muted">
              Upload assignment files and let AI extract details automatically.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Cloud Sync</h3>
            <p className="text-sm text-muted">
              Sign in to sync your data across all your devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
