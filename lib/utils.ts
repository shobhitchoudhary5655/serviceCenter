import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function generateInvoiceNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
}

export function calculateGST(amount: number, gstRate: number = 18, isInterstate: boolean = false): {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
} {
  const gstAmount = (amount * gstRate) / 100;
  
  if (isInterstate) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: amount + gstAmount,
    };
  } else {
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    return {
      cgst,
      sgst,
      igst: 0,
      total: amount + gstAmount,
    };
  }
}

