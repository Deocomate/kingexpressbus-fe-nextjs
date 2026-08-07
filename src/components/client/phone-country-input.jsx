"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

// Same [dialCode, iso2, name] list as create.blade.php's inline script,
// ported verbatim so the searchable country dropdown matches 1:1.
const COUNTRIES = [
  ["+84", "vn", "Việt Nam"],
  ["+1", "us", "United States"],
  ["+44", "gb", "United Kingdom"],
  ["+82", "kr", "South Korea"],
  ["+81", "jp", "Japan"],
  ["+86", "cn", "China"],
  ["+66", "th", "Thailand"],
  ["+856", "la", "Laos"],
  ["+855", "kh", "Cambodia"],
  ["+61", "au", "Australia"],
  ["+33", "fr", "France"],
  ["+49", "de", "Germany"],
  ["+91", "in", "India"],
  ["+65", "sg", "Singapore"],
  ["+60", "my", "Malaysia"],
  ["+63", "ph", "Philippines"],
  ["+62", "id", "Indonesia"],
  ["+886", "tw", "Taiwan"],
  ["+852", "hk", "Hong Kong"],
  ["+853", "mo", "Macau"],
  ["+7", "ru", "Russia"],
  ["+39", "it", "Italy"],
  ["+34", "es", "Spain"],
  ["+31", "nl", "Netherlands"],
  ["+46", "se", "Sweden"],
  ["+41", "ch", "Switzerland"],
  ["+64", "nz", "New Zealand"],
  ["+353", "ie", "Ireland"],
  ["+48", "pl", "Poland"],
  ["+380", "ua", "Ukraine"],
  ["+90", "tr", "Türkiye"],
  ["+966", "sa", "Saudi Arabia"],
  ["+971", "ae", "UAE"],
  ["+972", "il", "Israel"],
  ["+55", "br", "Brazil"],
  ["+52", "mx", "Mexico"],
  ["+54", "ar", "Argentina"],
  ["+57", "co", "Colombia"],
  ["+234", "ng", "Nigeria"],
  ["+27", "za", "South Africa"],
  ["+20", "eg", "Egypt"],
  ["+43", "at", "Austria"],
  ["+32", "be", "Belgium"],
  ["+420", "cz", "Czech Republic"],
  ["+45", "dk", "Denmark"],
  ["+358", "fi", "Finland"],
  ["+30", "gr", "Greece"],
  ["+36", "hu", "Hungary"],
  ["+47", "no", "Norway"],
  ["+351", "pt", "Portugal"],
  ["+40", "ro", "Romania"],
  ["+421", "sk", "Slovakia"],
  ["+386", "si", "Slovenia"],
  ["+93", "af", "Afghanistan"],
  ["+880", "bd", "Bangladesh"],
  ["+95", "mm", "Myanmar"],
  ["+977", "np", "Nepal"],
  ["+92", "pk", "Pakistan"],
  ["+94", "lk", "Sri Lanka"],
  ["+973", "bh", "Bahrain"],
  ["+964", "iq", "Iraq"],
  ["+962", "jo", "Jordan"],
  ["+965", "kw", "Kuwait"],
  ["+961", "lb", "Lebanon"],
  ["+968", "om", "Oman"],
  ["+974", "qa", "Qatar"],
  ["+967", "ye", "Yemen"],
  ["+213", "dz", "Algeria"],
  ["+254", "ke", "Kenya"],
  ["+212", "ma", "Morocco"],
  ["+256", "ug", "Uganda"],
  ["+263", "zw", "Zimbabwe"],
];
const SORTED_BY_DIAL_LENGTH = [...COUNTRIES].sort(
  (a, b) => b[0].length - a[0].length,
);
const DEFAULT_DIAL_CODE = "+84";
const DEFAULT_ISO2 = "vn";

/**
 * Port of the vanilla-JS "phone-input-wrapper" widget in create.blade.php:
 * flag button -> searchable country dropdown, editable dial-code field,
 * and a number field that auto-detects a pasted "+<dialcode><number>".
 * Emits the combined E.164-ish string ("+84912345678") via onChange.
 */
export function PhoneCountryInput({ onChange, hasError, placeholder, id }) {
  const t = useTranslations("client.booking.create");
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [iso2, setIso2] = useState(DEFAULT_ISO2);
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const numberInputRef = useRef(null);
  useEffect(() => {
    const digits = number.replace(/[^\d]/g, "");
    onChange(digits ? `${dialCode}${digits}` : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialCode, number]);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      ([dial, code, name]) =>
        name.toLowerCase().includes(q) || dial.includes(q) || code.includes(q),
    );
  }, [search]);
  function selectCountry(nextDial, nextIso2) {
    setDialCode(nextDial);
    setIso2(nextIso2);
    setOpen(false);
    numberInputRef.current?.focus();
  }
  function handleNumberChange(raw) {
    let val = raw.replace(/[a-zA-Z]/g, "");
    if (val.startsWith("+")) {
      const match = SORTED_BY_DIAL_LENGTH.find(([dial]) =>
        val.startsWith(dial),
      );
      if (match) {
        setDialCode(match[0]);
        setIso2(match[1]);
        setNumber(val.slice(match[0].length));
        return;
      }
      val = val.slice(1);
    }
    setNumber(val);
  }
  function handleDialCodeChange(raw) {
    let val = raw.replace(/[^\d+]/g, "");
    if (!val.startsWith("+")) val = `+${val}`;
    setDialCode(val);
    const match = SORTED_BY_DIAL_LENGTH.find(([dial]) => dial === val);
    if (match) setIso2(match[1]);
  }
  function handleDialCodeBlur() {
    if (!dialCode || dialCode === "+") {
      setDialCode(DEFAULT_DIAL_CODE);
      setIso2(DEFAULT_ISO2);
    }
  }
  return (
    <div
      ref={wrapperRef}
      id={id}
      className={`phone-input-wrapper${hasError ? " field-error" : ""}`}
    >
      <button
        type="button"
        className="phone-country-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country code"
        onClick={() => setOpen((v) => !v)}
      >
        {" "}
        <img
          src={`https://flagcdn.com/w40/${iso2}.png`}
          alt={iso2.toUpperCase()}
        />
        <span className="arrow">▼</span>
      </button>
      {open && (
        <div className="phone-dropdown open" role="listbox">
          <div className="phone-dropdown-search">
            <input
              type="text"
              autoFocus
              autoComplete="off"
              placeholder={t("search_country_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            />
          </div>
          <div className="phone-dropdown-list">
            {filtered.map(([dial, code, name]) => (
              <div
                key={code}
                role="option"
                aria-selected={dial === dialCode}
                className={`phone-dropdown-item${dial === dialCode ? " selected" : ""}`}
                onClick={() => selectCountry(dial, code)}
              >
                {" "}
                <img
                  src={`https://flagcdn.com/w40/${code}.png`}
                  alt={code}
                  loading="lazy"
                />
                <span className="country-name">{name}</span>
                <span className="dial-code">{dial}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <input
        type="text"
        className="phone-dial-code"
        value={dialCode}
        maxLength={5}
        placeholder="+84"
        autoComplete="off"
        aria-label="Dial code"
        onChange={(e) => handleDialCodeChange(e.target.value)}
        onBlur={handleDialCodeBlur}
      />
      <input
        ref={numberInputRef}
        type="tel"
        className="phone-number-input"
        inputMode="tel"
        value={number}
        placeholder={placeholder}
        onChange={(e) => handleNumberChange(e.target.value)}
      />
    </div>
  );
}
