import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Nexora</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Disaster Management &amp; Volunteer Recruitment Platform for Bangladesh
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/register/volunteer" className="btn-primary">Register as Volunteer</Link>
          <Link href="/register/ngo" className="btn-secondary">Register your NGO</Link>
          <Link href="/login" className="btn-secondary">Login</Link>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-semibold">Role-based access</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Super Admin, NGOs and Volunteers each have their own dashboard with role-scoped features.
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold">Area-based recruitment</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Filter volunteers by Division, District or Thana. Recruit in bulk via CSV.
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold">Disaster event coordination</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Create events, invite volunteers, track accept/decline/deploy status — all in one place.
          </p>
        </div>
      </section>
    </main>
  );
}