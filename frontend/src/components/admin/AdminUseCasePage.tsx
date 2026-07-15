"use client";

import AdminShell from "@/components/layout/AdminShell";

type Section = {
  icon: string;
  title: string;
  description: string;
  status?: string;
};

type Props = {
  title: string;
  subtitle: string;
  sections: Section[];
};

export default function AdminUseCasePage({ title, subtitle, sections }: Props) {
  return (
    <AdminShell>
      <div className="mx-auto max-w-[1400px] space-y-lg p-margin-mobile md:p-margin-desktop">
        <div>
          <h1 className="font-display-lg-mobile text-primary md:font-display-lg">{title}</h1>
          <p className="mt-xs font-body-lg text-on-surface-variant">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-md lg:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-xl border border-surface-variant bg-surface p-lg soft-shadow"
            >
              <div className="mb-sm flex items-center justify-between gap-md">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary">{section.icon}</span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">{section.title}</h2>
                </div>
                {section.status && (
                  <span className="rounded-full bg-secondary-container px-2 py-1 text-[10px] font-bold uppercase text-on-secondary-container">
                    {section.status}
                  </span>
                )}
              </div>
              <p className="font-body-md text-on-surface-variant">{section.description}</p>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
