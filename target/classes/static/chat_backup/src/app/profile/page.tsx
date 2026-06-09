"use client";

import { useState } from "react";
import { mockUser } from "@/lib/mock-data";
import CollectorShell from "@/components/layout/CollectorShell";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

  const fields = [
    { label: "First Name", value: "Alexander", type: "text" },
    { label: "Last Name", value: "Sterling", type: "text" },
    { label: "Email Address", value: mockUser.email, type: "email" },
    { label: "Phone Number", value: mockUser.phone, type: "tel" },
    { label: "Date of Birth", value: "1975-04-22", type: "date" },
    { label: "Nationality", value: "United States", type: "text" },
    { label: "Street Address", value: "1 Park Avenue, Suite 2800", type: "text" },
    { label: "City", value: "New York", type: "text" },
    { label: "Postal Code", value: "10016", type: "text" },
    { label: "Country", value: "United States of America", type: "text" },
  ];

  return (
    <CollectorShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Personal Information</h1>
            <p className="font-body-lg text-on-surface-variant mt-xs">Manage your profile details and preferences.</p>
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-xs bg-surface border border-outline-variant rounded-lg px-md py-sm font-label-md text-label-md hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{editing ? "close" : "edit"}</span>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-lg bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden soft-shadow">
              <img src={mockUser.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </button>
            )}
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">{mockUser.name}</h2>
            <p className="font-label-md text-label-md text-secondary mt-xs">{mockUser.role}</p>
            <div className="flex items-center gap-xs mt-sm">
              <span className="material-symbols-outlined text-on-tertiary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-label-sm text-label-sm text-on-tertiary-container">Identity Verified</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-lg border-b border-surface-variant pb-sm">
            Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {fields.map((field) => (
              <div key={field.label}>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{field.label}</label>
                {editing ? (
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                  />
                ) : (
                  <p className="font-body-md text-body-md text-on-surface py-2.5 px-4 bg-surface-container-low rounded-lg border border-surface-variant">
                    {field.value}
                  </p>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="mt-lg flex justify-end gap-sm">
              <button
                onClick={() => setEditing(false)}
                className="px-lg py-sm rounded-lg border border-outline-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-lg py-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-fixed-dim transition-colors glow-accent"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </CollectorShell>
  );
}
