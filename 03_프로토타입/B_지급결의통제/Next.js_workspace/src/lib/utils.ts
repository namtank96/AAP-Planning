import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKRW(amount: number) {
  return amount.toLocaleString("ko-KR") + "원";
}

export function formatKRWShort(amount: number) {
  if (amount >= 1_0000_0000) {
    return (amount / 1_0000_0000).toFixed(1).replace(/\.0$/, "") + "억원";
  }
  if (amount >= 1_0000) {
    return (amount / 1_0000).toFixed(0) + "만원";
  }
  return amount.toLocaleString("ko-KR") + "원";
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function formatRelativeTime(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (diff < 60_000) return "방금 전";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`;
  return `${Math.floor(diff / 86_400_000)}일 전`;
}

export function nowIso() {
  return new Date().toISOString();
}
