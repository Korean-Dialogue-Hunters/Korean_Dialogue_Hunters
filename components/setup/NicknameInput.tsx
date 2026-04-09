"use client";

import { useState, useEffect } from "react";
import { User, Dices } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WARM_THEME, COMMON_CLASSES } from "@/lib/designSystem";
import { generateRandomNickname, getNicknameMeaning, getByteLength, MAX_NICKNAME_BYTES } from "@/lib/nicknameGenerator";

interface NicknameInputProps {
  value: string;
  onChange: (nickname: string) => void;
}

function ByteDonut({ used, max }: { used: number; max: number }) {
  const ratio = Math.min(used / max, 1);
  const isOver = used > max;
  const isWarning = used / max >= 0.8;
  const fillColor = isOver ? "#E25555" : isWarning ? "#E8A020" : WARM_THEME.accent;
  const trackColor = "var(--color-card-border)";
  return (
    <div className="shrink-0 rounded-full"
      style={{ width: 20, height: 20, background: `conic-gradient(${fillColor} ${ratio * 360}deg, ${trackColor} 0deg)`, transition: "background 0.15s" }} />
  );
}

export default function NicknameInput({ value, onChange }: NicknameInputProps) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  /* 최초 마운트 시 추천 닉네임을 입력창에 바로 채움 */
  useEffect(() => {
    if (!value) onChange(generateRandomNickname());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const byteCount = getByteLength(value || "");
  const isOverLimit = byteCount > MAX_NICKNAME_BYTES;

  const meaning = value ? getNicknameMeaning(value) : null;

  return (
    <div className="space-y-4">
      <div className={`${COMMON_CLASSES.cardRounded} p-4 transition-all`}
        style={{
          backgroundColor: WARM_THEME.card,
          border: `1.5px solid ${isFocused ? WARM_THEME.accent : isOverLimit ? "#E25555" : WARM_THEME.cardBorder}`,
          boxShadow: isFocused ? `0 0 0 3px ${WARM_THEME.accentLight}` : "0 1px 3px rgba(0,0,0,0.04)",
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: WARM_THEME.accentLight, color: WARM_THEME.accent }}>
            <User size={20} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <input
              type="text" value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t("nickname.placeholder")}
              className="flex-1 min-w-0 bg-transparent text-base font-medium outline-none placeholder:font-normal"
              style={{ color: WARM_THEME.text, caretColor: WARM_THEME.accent }}
            />
            <ByteDonut used={byteCount} max={MAX_NICKNAME_BYTES} />
          </div>
        </div>
      </div>

      {/* 영어 뜻 안내 */}
      {meaning && (
        <p className="text-center text-sm" style={{ color: WARM_THEME.textSub }}>
          It means{" "}
          <span className="font-semibold" style={{ color: WARM_THEME.accent }}>
            &ldquo;{meaning}&rdquo;
          </span>{" "}
          in Korean!
        </p>
      )}

      <button type="button"
        onClick={() => onChange(generateRandomNickname())}
        className={`${COMMON_CLASSES.cardRounded} w-full p-3 flex items-center justify-center gap-2 transition-all active:scale-[0.97]`}
        style={{ backgroundColor: WARM_THEME.accent, color: "#FFFFFF" }}>
        <Dices size={18} strokeWidth={2} />
        <span className="text-sm font-bold">{t("nickname.randomBtn")}</span>
      </button>
    </div>
  );
}
