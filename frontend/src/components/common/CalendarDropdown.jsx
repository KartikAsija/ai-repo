import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function CalendarDropdown({ value, onChange, placeholder = "Select target date..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initialize viewDate based on value or current date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState(() => parseDate(value));

  // Sync viewDate when value changes
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const formatted = `${year}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleApplyPreset = (monthsToAdd) => {
    const target = new Date();
    target.setMonth(target.getMonth() + monthsToAdd);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setViewDate(target);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
  };

  // Format display string
  const formatDisplay = (val) => {
    if (!val) return "";
    const parsed = parseDate(val);
    if (isNaN(parsed.getTime())) return val;
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const selectedParts = value ? value.split("-") : [];
  const selectedYear = selectedParts[0] ? parseInt(selectedParts[0], 10) : null;
  const selectedMonth = selectedParts[1] ? parseInt(selectedParts[1], 10) - 1 : null;
  const selectedDay = selectedParts[2] ? parseInt(selectedParts[2], 10) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Input */}
      <div
        data-testid="calendar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0B1220] border border-[#334155] hover:border-slate-500 rounded-lg px-3 py-2 text-xs text-[#F8FAFC] cursor-pointer flex items-center justify-between transition-colors focus-within:ring-2 focus-within:ring-[#38BDF8]"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-[#38BDF8] shrink-0" />
          {value ? (
            <span className="font-medium text-[#F8FAFC]">
              {formatDisplay(value)} <span className="text-[#CBD5E1] font-mono text-[11px]">({value})</span>
            </span>
          ) : (
            <span className="text-[#CBD5E1]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#CBD5E1] hover:text-rose-400 p-0.5 rounded transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-[#111C33] border border-[#334155] rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-1 pb-2.5 mb-2.5 border-b border-[#334155] text-[10px]">
            <span className="text-[#CBD5E1] font-semibold uppercase tracking-wider">Presets:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-2 py-0.5 rounded bg-[#17243B] hover:bg-[#1f3150] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#334155] transition-colors"
              >
                +3 Mo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(6)}
                className="px-2 py-0.5 rounded bg-[#17243B] hover:bg-[#1f3150] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#334155] transition-colors"
              >
                +6 Mo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(12)}
                className="px-2 py-0.5 rounded bg-[#17243B] hover:bg-[#1f3150] text-[#CBD5E1] hover:text-[#F8FAFC] border border-[#334155] transition-colors"
              >
                +1 Yr
              </button>
            </div>
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-[#17243B] text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-xs text-[#F8FAFC]">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[#17243B] text-[#CBD5E1] hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-semibold text-[#CBD5E1] py-0.5">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty padding cells for start of month */}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <span key={`empty-${i}`} className="p-1" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDay === dayNum &&
                selectedMonth === month &&
                selectedYear === year;

              // Check if today
              const today = new Date();
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === month &&
                today.getFullYear() === year;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`w-8 h-7 text-xs rounded-md flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-[#0F766E] text-white font-bold shadow-sm"
                      : isToday
                      ? "border border-[#38BDF8] text-[#38BDF8] hover:bg-[#17243B]"
                      : "text-[#F8FAFC] hover:bg-[#17243B]"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer with Today shortcut */}
          <div className="mt-2.5 pt-2 border-t border-[#334155] flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={() => handleApplyPreset(0)}
              className="text-[#38BDF8] hover:text-sky-300 font-semibold"
            >
              Select Today
            </button>
            <span className="text-[#CBD5E1]">Click day to choose</span>
          </div>
        </div>
      )}
    </div>
  );
}
