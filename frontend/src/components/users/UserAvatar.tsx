"use client";

import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  className = "h-11 w-11",
}) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarUrl) return;
    let cancelled = false;

    fetch(`${API_BASE_URL}${avatarUrl}`, { credentials: "include" })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled) return;
        setSrc(blob ? URL.createObjectURL(blob) : null);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- objectURL dinamico autenticado
      <img
        src={src}
        alt={name}
        className={`${className} rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${className} flex items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200`}
    >
      <span className="font-semibold text-theme-sm">{getInitials(name)}</span>
    </span>
  );
};
