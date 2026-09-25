'use client';

export const STATUS_LABELS = {
  DRAFT: 'Draft',
  PENDING_VERIFICATION: 'Menunggu verifikasi',
  REVISION: 'Perlu revisi',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  PUBLISHED: 'Dipublikasikan',
  UNPUBLISHED: 'Tidak dipublikasikan',
  ARCHIVED: 'Arsip',
  PENDING: 'Menunggu',
};

export function StatusBadge({ status }) {
  const cls = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_VERIFICATION: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    REVISION: 'bg-orange-50 text-orange-800 ring-1 ring-orange-200',
    APPROVED: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    REJECTED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
    PUBLISHED: 'bg-navy-800 text-white',
  }[status] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{STATUS_LABELS[status] || status}</span>;
}

export function Panel({ title, description, action, children }) {
  return (
    <section className="rounded-2xl border border-navy-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-navy-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl text-navy-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-navy-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children = 'Belum ada data.' }) {
  return <div className="px-6 py-12 text-center text-sm text-navy-500">{children}</div>;
}

export function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{message}</div>;
}
