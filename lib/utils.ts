import { clsx, type ClassValue } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : int;
};

export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 2,
});
export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

export const round2 = (num: number) =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const generateId = () =>
  Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join("");

export const formatError = (error: unknown): string => {
  // ZodError (zod v3/v4 differences)
  if (typeof error === "object" && error !== null && "name" in error && error.name === "ZodError") {
    // v4 exposes issues array
    if ("issues" in error && Array.isArray(error.issues)) {
      const messages = error.issues.map((issue: { path?: (string | number)[]; message: string }) => {
        const path = Array.isArray(issue.path) ? issue.path.join(".") : issue.path;
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return messages.join(". ");
    }

    // Fallback for older shape
    if ("errors" in error && typeof error.errors === "object" && error.errors !== null) {
      const fieldErrors = Object.keys(error.errors as Record<string, unknown>).map((field) => {
        const err = (error.errors as Record<string, unknown>)[field] as { message?: string; path?: string };
        const errorMessage = err?.message ?? JSON.stringify(err);
        const path = err?.path ?? field;
        return `${path}: ${errorMessage}`;
      });
      return fieldErrors.join(". ");
    }

    // Last-resort stringification
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    return JSON.stringify(error);
  } else if (typeof error === "object" && error !== null && "name" in error && error.name === "ValidationError") {
    const errorObj = error as { errors?: Record<string, { message?: string }> };
    const fieldErrors = Object.keys(errorObj.errors || {}).map((field) => {
      const errorMessage = errorObj.errors?.[field]?.message ?? JSON.stringify(errorObj.errors?.[field]);
      return errorMessage;
    });
    return fieldErrors.join(". ");
  } else if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    const errorObj = error as { keyValue?: Record<string, unknown> };
    const duplicateField = Object.keys(errorObj.keyValue || {})[0];
    return `${duplicateField} already exists`;
  } else if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  } else {
    return JSON.stringify(error);
  }
};

export function calculateFutureDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}
export function getMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1);
  const monthName = date.toLocaleString("default", { month: "long" });
  const now = new Date();

  if (year === now.getFullYear() && month === now.getMonth() + 1) {
    return `${monthName} Ongoing`;
  }
  return monthName;
}
export function calculatePastDate(days: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - days);
  return currentDate;
}
export function timeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Set to 12:00 AM (next day)

  const diff = midnight.getTime() - now.getTime(); // Difference in milliseconds
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    // weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

export const getFilterUrl = ({
  params,
  category,
  tag,
  sort,
  price,
  rating,
  page,
}: {
  params: {
    q?: string;
    category?: string;
    tag?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
  tag?: string;
  category?: string;
  sort?: string;
  price?: string;
  rating?: string;
  page?: string;
}) => {
  const newParams = { ...params };
  if (category) newParams.category = category;
  if (tag) newParams.tag = toSlug(tag);
  if (price) newParams.price = price;
  if (rating) newParams.rating = rating;
  if (page) newParams.page = page;
  if (sort) newParams.sort = sort;
  return `/search?${new URLSearchParams(newParams).toString()}`;
};
