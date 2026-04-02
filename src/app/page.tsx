import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-primary mb-4">StudyBoard</h1>
        <p className="text-xl text-muted mb-8">
          Keep all your school assignments organized, track deadlines, manage
          your classes, and stay on top of your grades.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">&#128203;</div>
            <h3 className="font-semibold mb-1">Kanban Board</h3>
            <p className="text-sm text-muted">
              Drag assignments through To Do, In Progress, and Done columns.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">&#128197;</div>
            <h3 className="font-semibold mb-1">Calendar View</h3>
            <p className="text-sm text-muted">
              See all your deadlines at a glance on a monthly calendar.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-surface border border-border">
            <div className="text-2xl mb-2">&#9201;</div>
            <h3 className="font-semibold mb-1">Study Timer</h3>
            <p className="text-sm text-muted">
              Built-in Pomodoro timer to stay focused on your work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
