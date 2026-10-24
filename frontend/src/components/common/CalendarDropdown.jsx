import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

export default function CalendarDropdown({ value, onChange, placeholder = "Select target date..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

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
        className="w-full bg-[#0D1117] border border-[#30363D] hover:border-[#484F58] rounded-lg px-3 py-2 text-xs text-[#F0F6FC] cursor-pointer flex items-center justify-between transition-colors focus-within:border-[#58A6FF]"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-3.5 h-3.5 text-[#8B949E] shrink-0" />
          {value ? (
            <span className="font-medium text-[#F0F6FC]">
              {formatDisplay(value)} <span className="text-[#8B949E] font-mono text-[11px]">({value})</span>
            </span>
          ) : (
            <span className="text-[#8B949E]">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#8B949E] hover:text-[#F85149] p-0.5 rounded transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-[#161B22] border border-[#30363D] rounded-xl p-3 shadow-elevated">
          {/* Quick Presets */}
          <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b border-[#30363D] text-[10px]">
            <span className="text-[#8B949E] font-medium uppercase tracking-wider">Presets:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleApplyPreset(3)}
                className="px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
              >
                +3 Mo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(6)}
                className="px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
              >
                +6 Mo
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(12)}
                className="px-2 py-0.5 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] transition-colors"
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
              className="p-1 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-semibold text-[#F0F6FC]">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#8B949E] mb-1">
            {daysOfWeek.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="p-1 text-transparent">
                .
              </div>
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                selectedYear === year && selectedMonth === month && selectedDay === day;

              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`p-1.5 rounded-md text-center transition-colors text-[11px] font-medium ${
                    isSelected
                      ? "bg-[#1F6FEB] text-white font-semibold"
                      : isToday
                      ? "border border-[#58A6FF] text-[#58A6FF] hover:bg-[#21262D]"
                      : "text-[#F0F6FC] hover:bg-[#21262D]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[#30363D] flex items-center justify-between text-[10px]">
            <button
              type="button"
              onClick={() => handleApplyPreset(0)}
              className="text-[#58A6FF] hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[#8B949E] hover:text-[#F0F6FC]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
