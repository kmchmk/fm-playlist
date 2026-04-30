export const ALLOWED_EMAIL_DOMAIN =
  (process.env.ALLOWED_EMAIL_DOMAIN || "favoritemedium.com")
    .trim()
    .toLowerCase();

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function getMonthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}
