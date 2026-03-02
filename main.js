// QuoteFlow - Basit teklif veri modeli ve sayfa ortak fonksiyonları

const STORAGE_KEY = "quoteflow:quote";

function createEmptyQuote() {
  return {
    company: {
      name: "",
      logo: "", // data URL
      email: "",
      phone: "",
      bankName: "",
      iban: "",
    },
    client: {
      name: "",
      company: "",
      email: "",
    },
    items: [
      {
        title: "Web Tasarım",
        price: 5000,
        qty: 1,
        optional: false,
      },
    ],
    taxEnabled: true,
    taxRate: 0.2,
    currency: "TRY",
    locale: "tr-TR",
    includeOptional: false,
    brandColor: "#2563eb",
    validityDays: 15,
    quotePrefix: "QF-2026",
    quoteNumber: "001",
    termsText: "",
    totals: {
      subtotal: 5000,
      tax: 1000,
      total: 6000,
    },
  };
}

function loadQuote() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createEmptyQuote();
      saveQuote(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw);
    return normalizeQuote(parsed);
  } catch (e) {
    console.warn("QuoteFlow: LocalStorage okunamadı, sıfırdan başlatılıyor.", e);
    const fresh = createEmptyQuote();
    saveQuote(fresh);
    return fresh;
  }
}

function saveQuote(quote) {
  const normalized = normalizeQuote(quote);
  const withTotals = calculateTotals(normalized);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withTotals));
  return withTotals;
}

function normalizeQuote(raw) {
  const base = createEmptyQuote();
  const merged = {
    ...base,
    ...raw,
    company: { ...base.company, ...(raw.company || {}) },
    client: { ...base.client, ...(raw.client || {}) },
    items: Array.isArray(raw.items) && raw.items.length ? raw.items.map((i) => ({ optional: false, ...i })) : base.items,
  };
  if (typeof merged.taxEnabled !== "boolean") merged.taxEnabled = true;
  if (typeof merged.taxRate !== "number") merged.taxRate = 0.2;
  if (typeof merged.currency !== "string") merged.currency = "TRY";
  if (typeof merged.locale !== "string") merged.locale = "tr-TR";
  if (typeof merged.includeOptional !== "boolean") merged.includeOptional = false;
  if (typeof merged.brandColor !== "string") merged.brandColor = "#2563eb";
  if (typeof merged.validityDays !== "number") merged.validityDays = 15;
  if (typeof merged.quotePrefix !== "string") merged.quotePrefix = "QF-2026";
  if (typeof merged.quoteNumber !== "string") merged.quoteNumber = "001";
  if (typeof merged.termsText !== "string") merged.termsText = "";
  return calculateTotals(merged);
}

function calculateTotals(quote) {
  const useOptional = !!quote.includeOptional;
  const subtotal = (quote.items || []).reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    if (item.optional && !useOptional) return sum;
    return sum + price * qty;
  }, 0);

  const tax = quote.taxEnabled ? subtotal * quote.taxRate : 0;
  const total = subtotal + tax;

  return {
    ...quote,
    totals: {
      subtotal,
      tax,
      total,
    },
  };
}

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let loc = "tr-TR";
    let cur = "TRY";
    if (raw) {
      try {
        const q = JSON.parse(raw);
        if (q && typeof q.locale === "string") loc = q.locale;
        if (q && typeof q.currency === "string") cur = q.currency;
      } catch {}
    }
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)}`;
  }
}

function formatDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function scrollToDemo() {
  const el = document.getElementById("demo-preview");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
});

