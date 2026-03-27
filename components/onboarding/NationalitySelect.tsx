"use client";

/* ──────────────────────────────────────────
   NationalitySelect 컴포넌트
   - 자주 쓰는 국가를 드롭다운 최상단에 고정
   - 타이핑으로 국가 검색 및 자동완성
   - IP 기반 자동 국가 선택 (ipapi.co 호출)
   ────────────────────────────────────────── */

import { useState, useEffect, useRef } from "react";
import { POPULAR_COUNTRIES } from "@/types/onboarding";
import { ALL_COUNTRIES, Country } from "@/types/countries";

interface NationalitySelectProps {
  value: string;                        // 현재 선택된 국가 코드
  onChange: (code: string) => void;     // 선택 변경 콜백
}

export default function NationalitySelect({
  value,
  onChange,
}: NationalitySelectProps) {
  const [query, setQuery] = useState("");          // 검색 입력값
  const [isOpen, setIsOpen] = useState(false);     // 드롭다운 열림 여부
  const [isDetecting, setIsDetecting] = useState(false); // IP 감지 로딩
  const wrapperRef = useRef<HTMLDivElement>(null); // 외부 클릭 감지용

  // 현재 선택된 국가의 이름 가져오기
  const selectedCountry = ALL_COUNTRIES.find((c) => c.code === value);
  const displayValue = selectedCountry ? selectedCountry.name : "";

  /* ── IP 기반 자동 국가 감지 (마운트 시 1회 실행) ── */
  useEffect(() => {
    // 이미 선택된 값이 있으면 감지 생략
    if (value) return;

    const detectCountry = async () => {
      setIsDetecting(true);
      try {
        // ipapi.co: 무료 IP 기반 국가 감지 API
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data.country_code) {
          onChange(data.country_code);
        }
      } catch {
        // 감지 실패 시 조용히 무시 (사용자가 직접 선택)
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 외부 클릭 시 드롭다운 닫기 ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── 검색어 기준 국가 필터링 ── */
  const filtered: Country[] = query.trim()
    ? ALL_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // 검색어 없을 때: 자주 쓰는 국가 목록 표시
  const showPopular = query.trim() === "";

  /* ── 국가 선택 처리 ── */
  const handleSelect = (code: string) => {
    onChange(code);
    setQuery("");
    setIsOpen(false);
  };

  /* ── 입력 시 드롭다운 열기 ── */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* 선택 입력창 */}
      <div
        className="flex items-center w-full rounded-xl bg-surface border border-surface-border px-4 py-3 cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          placeholder={isDetecting ? "국가 감지 중..." : "국가를 검색하세요"}
          value={isOpen ? query : displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent text-foreground placeholder-tab-inactive text-sm outline-none"
        />
        {/* 화살표 아이콘 */}
        <span className={`text-tab-inactive transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▾
        </span>
      </div>

      {/* 드롭다운 목록 */}
      {isOpen && (
        <ul className="absolute top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl bg-card-bg border border-card-border z-10 shadow-xl">
          {showPopular ? (
            <>
              {/* 자주 쓰는 국가 섹션 */}
              <li className="px-4 py-1.5 text-[10px] text-tab-inactive uppercase tracking-wider">
                자주 쓰는 국가
              </li>
              {POPULAR_COUNTRIES.map((c) => (
                <CountryItem
                  key={c.code}
                  code={c.code}
                  name={c.name}
                  isSelected={value === c.code}
                  onSelect={handleSelect}
                />
              ))}
              {/* 구분선 */}
              <li className="border-t border-surface-border my-1" />
              {/* 전체 국가 */}
              <li className="px-4 py-1.5 text-[10px] text-tab-inactive uppercase tracking-wider">
                전체 국가
              </li>
              {ALL_COUNTRIES.map((c) => (
                <CountryItem
                  key={c.code}
                  code={c.code}
                  name={c.name}
                  isSelected={value === c.code}
                  onSelect={handleSelect}
                />
              ))}
            </>
          ) : filtered.length > 0 ? (
            /* 검색 결과 */
            filtered.map((c) => (
              <CountryItem
                key={c.code}
                code={c.code}
                name={c.name}
                isSelected={value === c.code}
                onSelect={handleSelect}
              />
            ))
          ) : (
            <li className="px-4 py-3 text-sm text-tab-inactive text-center">
              검색 결과 없음
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/* ── 드롭다운 항목 단위 컴포넌트 ── */
function CountryItem({
  code,
  name,
  isSelected,
  onSelect,
}: {
  code: string;
  name: string;
  isSelected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(code)}
        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
          isSelected
            ? "bg-orange/20 text-orange"
            : "text-foreground hover:bg-surface-border"
        }`}
      >
        {name}
      </button>
    </li>
  );
}
