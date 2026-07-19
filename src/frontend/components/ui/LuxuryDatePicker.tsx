"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type LuxuryDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  placeholder?: string;
  ariaLabel: string;
};

function parseDate(value?: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplay(value: string, locale: string) {
  const date = parseDate(value);
  return date
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date)
    : "";
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export default function LuxuryDatePicker({
  value,
  onChange,
  max,
  min,
  placeholder,
  ariaLabel,
}: LuxuryDatePickerProps) {
  const t = useTranslations("datePicker");
  const locale = useLocale();
  const localeTag = locale === "vi" ? "vi-VN" : "en-US";
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => {
        const label = new Intl.DateTimeFormat(localeTag, { month: "long" }).format(
          new Date(2024, month, 1),
        );
        return label.charAt(0).toUpperCase() + label.slice(1);
      }),
    [localeTag],
  );
  const weekdays = locale === "vi"
    ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const selectedDate = parseDate(value);
  const maxDate = parseDate(max);
  const minDate = parseDate(min);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const initialView = selectedDate ?? maxDate ?? today;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => startOfMonth(initialView));

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const firstDay = startOfMonth(viewDate);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(
      firstDay.getFullYear(),
      firstDay.getMonth(),
      1 - mondayOffset,
    );

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      );
      return {
        date,
        value: formatValue(date),
        inCurrentMonth: date.getMonth() === viewDate.getMonth(),
      };
    });
  }, [viewDate]);

  const earliestYear = minDate?.getFullYear() ?? 1900;
  const latestYear = maxDate?.getFullYear() ?? today.getFullYear() + 20;
  const years = useMemo(
    () =>
      Array.from(
        { length: Math.max(1, latestYear - earliestYear + 1) },
        (_, index) => latestYear - index,
      ),
    [earliestYear, latestYear],
  );

  const previousMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const previousDisabled = Boolean(minDate && endOfMonth(previousMonth) < minDate);
  const nextDisabled = Boolean(maxDate && startOfMonth(nextMonth) > maxDate);
  const todayDisabled = Boolean(
    (minDate && today < minDate) || (maxDate && today > maxDate),
  );

  function monthUnavailable(month: number) {
    const candidate = new Date(viewDate.getFullYear(), month, 1);
    return Boolean(
      (minDate && endOfMonth(candidate) < minDate) ||
        (maxDate && startOfMonth(candidate) > maxDate),
    );
  }

  function changeYear(year: number) {
    let month = viewDate.getMonth();
    if (minDate && year === minDate.getFullYear()) {
      month = Math.max(month, minDate.getMonth());
    }
    if (maxDate && year === maxDate.getFullYear()) {
      month = Math.min(month, maxDate.getMonth());
    }
    setViewDate(new Date(year, month, 1));
  }

  function selectDate(date: Date) {
    onChange(formatValue(date));
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-haspopup="dialog"
        onClick={() => {
          if (!open) setViewDate(startOfMonth(selectedDate ?? maxDate ?? today));
          setOpen((current) => !current);
        }}
        className={`flex w-full items-center justify-between rounded-xl border bg-white/5 px-4 py-3 text-left text-sm outline-none transition ${
          open
            ? "border-[var(--luxora-gold)] ring-2 ring-[var(--luxora-gold)]/10"
            : "border-white/10 hover:border-white/20 focus-visible:border-[var(--luxora-gold)]"
        }`}
      >
        <span className={value ? "text-white" : "text-white/30"}>
          {formatDisplay(value, localeTag) || placeholder || t("selectDate")}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-[18px] w-[18px] transition ${
            open ? "text-[var(--luxora-gold-light)]" : "text-white/45"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" d="M7 3v3m10-3v3M4.5 9.5h15" />
          <rect x="3.5" y="5" width="17" height="16" rx="3" />
        </svg>
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-label={t("calendarLabel", { label: ariaLabel.toLocaleLowerCase(localeTag) })}
          className="absolute left-0 top-[calc(100%+0.4rem)] z-50 w-[min(15rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-[var(--luxora-gold)]/25 bg-[#0c0d0f] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.03)]"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewDate(previousMonth)}
              disabled={previousDisabled}
              className="grid size-7 shrink-0 place-items-center rounded-md text-white/55 transition hover:bg-white/5 hover:text-[var(--luxora-gold-light)] disabled:cursor-not-allowed disabled:opacity-20"
              aria-label={t("previousMonth")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="flex min-w-0 flex-1 gap-1">
              <select
                aria-label={t("selectMonth")}
                value={viewDate.getMonth()}
                onChange={(event) =>
                  setViewDate(
                    new Date(viewDate.getFullYear(), Number(event.target.value), 1),
                  )
                }
                className="min-w-0 flex-1 cursor-pointer rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[10px] font-semibold text-white outline-none transition hover:border-[var(--luxora-gold)]/40 focus:border-[var(--luxora-gold)]"
              >
                {months.map((month, index) => (
                  <option
                    key={month}
                    value={index}
                    disabled={monthUnavailable(index)}
                    className="bg-[#0c0d0f]"
                  >
                    {month}
                  </option>
                ))}
              </select>
              <select
                aria-label={t("selectYear")}
                value={viewDate.getFullYear()}
                onChange={(event) => changeYear(Number(event.target.value))}
                className="w-16 cursor-pointer rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[10px] font-semibold text-white outline-none transition hover:border-[var(--luxora-gold)]/40 focus:border-[var(--luxora-gold)]"
              >
                {years.map((year) => (
                  <option key={year} value={year} className="bg-[#0c0d0f]">
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewDate(nextMonth)}
              disabled={nextDisabled}
              className="grid size-7 shrink-0 place-items-center rounded-md text-white/55 transition hover:bg-white/5 hover:text-[var(--luxora-gold-light)] disabled:cursor-not-allowed disabled:opacity-20"
              aria-label={t("nextMonth")}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 border-b border-white/[0.07] pb-1">
            {weekdays.map((weekday, index) => (
              <span
                key={weekday}
                className={`text-center text-[9px] font-semibold uppercase tracking-wide ${
                  index > 4 ? "text-[var(--luxora-gold)]/70" : "text-white/35"
                }`}
              >
                {weekday}
              </span>
            ))}
          </div>

          <div className="mt-0.5 grid grid-cols-7">
            {calendarDays.map((item) => {
              const isSelected = Boolean(selectedDate && sameDay(item.date, selectedDate));
              const isToday = sameDay(item.date, today);
              const isDisabled = Boolean(
                (minDate && item.date < minDate) || (maxDate && item.date > maxDate),
              );

              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDate(item.date)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={isSelected}
                  aria-label={new Intl.DateTimeFormat(localeTag, {
                    dateStyle: "full",
                  }).format(item.date)}
                  className={`mx-auto grid size-7 place-items-center rounded-full text-[10px] transition ${
                    isSelected
                      ? "bg-[var(--luxora-gold)] font-bold text-black shadow-[0_0_18px_rgba(217,170,85,0.28)]"
                      : isToday
                        ? "border border-[var(--luxora-gold)]/60 text-[var(--luxora-gold-light)]"
                        : item.inCurrentMonth
                          ? "text-white/80 hover:bg-white/[0.07] hover:text-white"
                          : "text-white/20 hover:bg-white/[0.04] hover:text-white/45"
                  } disabled:cursor-not-allowed disabled:border-transparent disabled:text-white/10 disabled:hover:bg-transparent`}
                >
                  {item.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-between border-t border-white/[0.07] pt-1">
            <button
              type="button"
              disabled={todayDisabled}
              onClick={() => selectDate(today)}
              className="rounded-md px-1.5 py-1 text-[10px] font-semibold text-[var(--luxora-gold-light)] transition hover:bg-[var(--luxora-gold)]/10 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {t("today")}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="rounded-md px-1.5 py-1 text-[10px] text-white/40 transition hover:bg-white/5 hover:text-white/70"
              >
                {t("clearDate")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
