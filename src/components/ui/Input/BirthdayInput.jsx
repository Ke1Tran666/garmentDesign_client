import { CalendarDays, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const parseBirthdayValue = (value) => {
  if (!value || typeof value !== "string") {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const [year, month, day] = parts;

  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year,
  };
};

const BirthdayInput = ({
  value = "",
  onChange = () => {},

  containerClassName = "",
  inputClassName = "",
  calendarButtonClassName = "",
  popupClassName = "",
  popupHeaderClassName = "",
  selectedDateClassName = "bg-brand text-white",
}) => {
  const today = new Date();
  
  const [openBirthday, setOpenBirthday] = useState(false);
  const birthdayPickerRef = useRef(null);
  const initialBirthday = parseBirthdayValue(value);

  const [birthDay, setBirthDay] = useState(initialBirthday.day);
  const [birthMonth, setBirthMonth] = useState(initialBirthday.month);
  const [birthYear, setBirthYear] = useState(initialBirthday.year);

  const [currentMonth, setCurrentMonth] = useState(
    initialBirthday.month ? Number(initialBirthday.month) - 1 : today.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    initialBirthday.year ? Number(initialBirthday.year) : today.getFullYear()
  );

  const birthDayRef = useRef(birthDay);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const updateBirthday = useCallback(
    (day, month, year) => {
      if (!day || !month || !year || String(year).length !== 4) {
        return;
      }

      const formattedBirthday = `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      onChange(formattedBirthday);
    },
    [onChange]
  );

  useEffect(() => {
    birthDayRef.current = birthDay;
  }, [birthDay]);

  useEffect(() => {
    if (!birthMonth || !birthYear || !birthDayRef.current) return;

    const month = Number(birthMonth);
    const year = Number(birthYear);
    const day = Number(birthDayRef.current);
    const maxDays = new Date(year, month, 0).getDate();

    if (day > maxDays) {
      setBirthDay(String(maxDays));
      updateBirthday(String(maxDays), birthMonth, birthYear);
    }
  }, [birthMonth, birthYear, updateBirthday]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        birthdayPickerRef.current &&
        !birthdayPickerRef.current.contains(e.target)
      ) {
        setOpenBirthday(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const years = Array.from(
    { length: 101 },
    (_, index) => today.getFullYear() - index
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);

    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    startDate.setDate(firstDay.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    });
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
      return;
    }

    setCurrentMonth(currentMonth - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
      return;
    }

    setCurrentMonth(currentMonth + 1);
  };

  const handleSelectDate = (date) => {
    const day = String(date.getDate());
    const month = String(date.getMonth() + 1);
    const year = String(date.getFullYear());

    setBirthDay(day);
    setBirthMonth(month);
    setBirthYear(year);

    updateBirthday(day, month, year);
    setOpenBirthday(false);
  };

  return (
    <div
      ref={birthdayPickerRef}
      className={`relative ${containerClassName}`}
    >
      <div className="flex items-end gap-3">
        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={birthDay}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value === "") {
              setBirthDay("");
              return;
            }

            let number = Number(value);

            if (number > 31) number = 31;

            setBirthDay(String(number));
            updateBirthday(String(number), birthMonth, birthYear);
          }}
          placeholder="Day"
          className={`
            h-13 w-full flex-1 rounded-xl border-2 border-white/25
            bg-transparent px-4 text-center text-sm text-white
            outline-none transition-all duration-300
            placeholder:text-white/45
            focus:border-auth-accent
            focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
            ${inputClassName}
          `}
        />

        <input
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={birthMonth}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");

            if (value === "") {
              setBirthMonth("");
              return;
            }

            let number = Number(value);

            if (number > 12) number = 12;

            setBirthMonth(String(number));
            updateBirthday(birthDay, String(number), birthYear);
          }}
          placeholder="Month"
          className={`
            h-13 w-full flex-1 rounded-xl border-2 border-white/25
            bg-transparent px-4 text-center text-sm text-white
            outline-none transition-all duration-300
            placeholder:text-white/45
            focus:border-auth-accent
            focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
            ${inputClassName}
          `}
        />

        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={birthYear}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");

            setBirthYear(value);
            updateBirthday(birthDay, birthMonth, value);
          }}
          placeholder="Year"
          className={`
            h-13 w-full flex-2 rounded-xl border-2 border-white/25
            bg-transparent px-4 text-center text-sm text-white
            outline-none transition-all duration-300
            placeholder:text-white/45
            focus:border-auth-accent
            focus:shadow-[0_0_18px_rgba(128,208,255,0.35)]
            ${inputClassName}
          `}
        />

        <button
          type="button"
          onClick={() => {
            if (!openBirthday) {
              if (birthMonth) setCurrentMonth(Number(birthMonth) - 1);
              if (birthYear) setCurrentYear(Number(birthYear));
            }

            setOpenBirthday(!openBirthday);
          }}
          className={`
            flex h-14.5 min-w-14.5 items-center justify-center
            rounded-xl border-2 border-white/25 bg-white/10 px-4
            text-white transition-all duration-300
            hover:border-white/35 hover:bg-white/20
            ${calendarButtonClassName}
          `}
        >
          <CalendarDays className="h-5 w-5" />
        </button>
      </div>

      {openBirthday && (
        <div
          className={`
            absolute right-0 bottom-0 z-50
            w-full overflow-hidden rounded-2xl border-2 border-[#e5d84c]
            bg-surface text-text-strong shadow-2xl
            ${popupClassName}
          `}
        >
          <div
            className={`
              flex items-center justify-between gap-3
              bg-surface-muted px-4 py-4
              ${popupHeaderClassName}
            `}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              className="text-3xl text-text-default"
            >
              ‹
            </button>

            <div className="flex flex-1 gap-2">
              <div className="relative w-full">
                <select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="
                    h-11 w-full appearance-none rounded-lg
                    border border-input bg-surface
                    px-3 pr-10 text-sm font-semibold leading-none
                    outline-none
                  "
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>

              <div className="relative w-full">
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="
                    h-11 w-full appearance-none rounded-lg
                    border border-input bg-surface
                    px-3 pr-10 text-sm font-semibold leading-none
                    outline-none
                  "
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="text-3xl text-text-default"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 px-4 pt-4 text-center text-sm font-bold text-text-default">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 px-4 py-4 text-center">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;

              const isSelected =
                date.getDate() === Number(birthDay) &&
                date.getMonth() + 1 === Number(birthMonth) &&
                date.getFullYear() === Number(birthYear);

              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleSelectDate(date)}
                  className={`
                    mx-auto flex h-9 w-9 items-center justify-center
                    rounded-lg text-sm transition
                    ${
                      isSelected
                        ? selectedDateClassName
                        : isCurrentMonth
                          ? "text-text-default hover:bg-surface-muted"
                          : "text-text-subtle"
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthdayInput;