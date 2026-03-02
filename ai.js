 (function () {
   const LS_KEY = "quoteflow:openrouter_key";
   const LS_MODEL = "quoteflow:ai:model";
   const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
   function getApiKey() {
     const k = window.OPENROUTER_API_KEY || localStorage.getItem(LS_KEY) || "";
     return typeof k === "string" ? k.trim() : "";
   }
   function setApiKey(k) {
     if (typeof k === "string" && k.trim()) {
       localStorage.setItem(LS_KEY, k.trim());
     }
   }
   function getModel() {
     return localStorage.getItem(LS_MODEL) || "anthropic/claude-3.5-sonnet";
   }
   function setModel(m) {
     if (typeof m === "string" && m.trim()) {
       localStorage.setItem(LS_MODEL, m.trim());
     }
   }
   const LS_PROFILE = "quoteflow:ai:profile";
   function getProfile() {
     try {
       const raw = localStorage.getItem(LS_PROFILE);
       if (!raw) return {};
       const p = JSON.parse(raw);
       return typeof p === "object" && p ? p : {};
     } catch {
       return {};
     }
   }
   function setProfile(profile) {
     try {
       const p = typeof profile === "object" && profile ? profile : {};
       localStorage.setItem(LS_PROFILE, JSON.stringify(p));
     } catch {}
   }
   function buildSystem(kind) {
     const p = getProfile();
     const tone = p.tone || "Profesyonel ve teknik, net ve Türkçe";
     const sector = p.sector || "Freelancer hizmetleri (web tasarım, yazılım, danışmanlık)";
     const catalog = Array.isArray(p.catalog) ? p.catalog : [];
     const pricing = p.pricing || "Fiyatları TL/TRY cinsinden sayısal ver, saatlik/günlük oranlara uygun";
     const base =
       "QuoteFlow için asistan. Amaç: tek formdan profesyonel teklif PDF’i hazırlamada FREELANCER’a yardımcı olmak. " +
       "Dil: Türkçe. Ton: " +
       tone +
       ". Hedef sektör: " +
       sector +
       ". Katalog örnekleri: " +
       JSON.stringify(catalog) +
       ". Fiyatlama yönergeleri: " +
       pricing +
       ". Çıktılar yalın, teknik ve gerçekçi; pazarlama/promo dili kullanılmaz, abartılı vaatlerden kaçınır.";
     if (kind === "items")
       return (
         base +
         " Yalnızca JSON döndür. Şema: {items:[{title:string,price:number,qty:number}]}. " +
         "Fiyatlar sayısal, qty tamsayı. Zaman bazlı hizmetlerde qty=saat/gün. En fazla 6 kalem."
       );
     if (kind === "refine")
       return (
         base +
         " Yalnızca JSON döndür. Şema: {items:[{title:string,price:number,qty:number}]}. " +
         "Başlıkları netleştir (teslimatlar, kapsam), mantıksız adetleri düzelt, fiyatları makul yuvarla. En fazla 8 kalem."
       );
     if (kind === "email")
       return (
         base +
         " Yalnızca JSON döndür. Şema: {email_body:string}. " +
         "Kısa, net ve profesyonel e‑posta; pazarlama dili yok; teslimatlar ve toplam özetlenir. En fazla 150 kelime."
       );
     if (kind === "terms")
       return (
         base +
         " Yalnızca JSON döndür. Şema: {terms:string}. İçerik: geçerlilik, ödeme, kapsam ve hariçler. En fazla 120 kelime."
       );
     if (kind === "support")
       return base + " Müşteri hizmetleri asistanı. Net, kısa, çözüm odaklı ve adım adım yönlendir; freelancer’a pratik öneriler ver.";
     return base;
   }
  async function request(messages, temperature, options) {
     const key = getApiKey();
     if (!key) {
       throw new Error("OpenRouter API anahtarı gerekli");
     }
     const body = {
       model: (options && options.model) || getModel(),
       messages,
       temperature: typeof temperature === "number" ? temperature : 0.7,
       max_tokens: (options && options.max_tokens) || 600,
     };
     const headers = {
       "Content-Type": "application/json",
       Authorization: "Bearer " + key,
       "X-Title": "QuoteFlow",
     };
     const ref = location && location.origin ? location.origin : "http://localhost";
     headers["HTTP-Referer"] = ref;
     const res = await fetch(ENDPOINT, {
       method: "POST",
       headers,
       body: JSON.stringify(body),
     });
     if (!res.ok) {
       const txt = await res.text().catch(() => "");
       throw new Error("OpenRouter hata: " + res.status + " " + txt);
     }
     const data = await res.json();
     const content =
       data &&
       data.choices &&
       data.choices[0] &&
       data.choices[0].message &&
       data.choices[0].message.content
         ? data.choices[0].message.content
         : "";
     return content;
   }
   function toContext(quote) {
     const q = quote || {};
     return {
       company: q.company || {},
       client: q.client || {},
       items: Array.isArray(q.items) ? q.items : [],
       totals: q.totals || {},
       taxEnabled: !!q.taxEnabled,
       taxRate: typeof q.taxRate === "number" ? q.taxRate : 0.2,
     };
   }
  async function suggestItems(quote, prompt) {
     const ctx = toContext(quote);
     const sys = buildSystem("items");
     const user = JSON.stringify({
       prompt: prompt || "",
       context: ctx,
     });
     const msgs = [
       { role: "system", content: sys },
       { role: "user", content: user },
     ];
     const configs = [
       { max_tokens: 600, model: getModel() },
       { max_tokens: 300, model: getModel() },
       { max_tokens: 300, model: "openai/gpt-4o-mini" },
       { max_tokens: 200, model: "openai/gpt-4o-mini" },
     ];
     let content = "";
     let lastErr = null;
     for (const cfg of configs) {
       try {
         content = await request(msgs, 0.3, cfg);
         if (content) break;
       } catch (e) {
         lastErr = e;
       }
     }
     if (!content && lastErr) throw lastErr;
     let parsed = null;
     try {
       const match = content.match(/\{[\s\S]*\}$/);
       const jsonText = match ? match[0] : content;
       parsed = JSON.parse(jsonText);
     } catch (e) {
       throw new Error("AI yanıtı çözümlenemedi");
     }
     const items = Array.isArray(parsed.items) ? parsed.items : [];
     return items
       .filter((i) => i && typeof i.title === "string")
       .map((i) => ({
         title: String(i.title || "").trim(),
         price: Number(i.price) || 0,
         qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
       }));
   }
  async function rewriteEmail(quote) {
     const ctx = toContext(quote);
     const sys = buildSystem("email");
     const user = JSON.stringify({ context: ctx });
     const msgs = [
       { role: "system", content: sys },
       { role: "user", content: user },
     ];
     const configs = [
       { max_tokens: 400, model: getModel() },
       { max_tokens: 250, model: getModel() },
       { max_tokens: 250, model: "openai/gpt-4o-mini" },
       { max_tokens: 180, model: "openai/gpt-4o-mini" },
     ];
     let content = "";
     let lastErr = null;
     for (const cfg of configs) {
       try {
         content = await request(msgs, 0.4, cfg);
         if (content) break;
       } catch (e) {
         lastErr = e;
       }
     }
     if (!content && lastErr) throw lastErr;
     try {
       const match = content.match(/\{[\s\S]*\}$/);
       const jsonText = match ? match[0] : content;
       const parsed = JSON.parse(jsonText);
       return String(parsed.email_body || "").trim();
     } catch (e) {
       throw new Error("AI e-posta oluşturma hatası");
     }
   }
  async function refineItems(quote) {
     const ctx = toContext(quote);
     const sys = buildSystem("refine");
     const user = JSON.stringify({ context: ctx });
     const msgs = [
       { role: "system", content: sys },
       { role: "user", content: user },
     ];
     const configs = [
       { max_tokens: 600, model: getModel() },
       { max_tokens: 350, model: getModel() },
       { max_tokens: 300, model: "openai/gpt-4o-mini" },
       { max_tokens: 200, model: "openai/gpt-4o-mini" },
     ];
     let content = "";
     let lastErr = null;
     for (const cfg of configs) {
       try {
         content = await request(msgs, 0.3, cfg);
         if (content) break;
       } catch (e) {
         lastErr = e;
       }
     }
     if (!content && lastErr) throw lastErr;
     let parsed = null;
     try {
       const match = content.match(/\{[\s\S]*\}$/);
       const jsonText = match ? match[0] : content;
       parsed = JSON.parse(jsonText);
     } catch (e) {
       throw new Error("AI yanıtı çözümlenemedi");
     }
     const items = Array.isArray(parsed.items) ? parsed.items : [];
     return items
       .filter((i) => i && typeof i.title === "string")
       .map((i) => ({
         title: String(i.title || "").trim(),
         price: Number(i.price) || 0,
         qty: Math.max(1, Math.floor(Number(i.qty) || 1)),
       }));
   }
  async function generateTerms(quote) {
     const ctx = toContext(quote);
     const sys = buildSystem("terms");
     const user = JSON.stringify({ context: ctx });
     const msgs = [
       { role: "system", content: sys },
       { role: "user", content: user },
     ];
     const configs = [
       { max_tokens: 350, model: getModel() },
       { max_tokens: 220, model: getModel() },
       { max_tokens: 220, model: "openai/gpt-4o-mini" },
       { max_tokens: 160, model: "openai/gpt-4o-mini" },
     ];
     let content = "";
     let lastErr = null;
     for (const cfg of configs) {
       try {
         content = await request(msgs, 0.3, cfg);
         if (content) break;
       } catch (e) {
         lastErr = e;
       }
     }
     if (!content && lastErr) throw lastErr;
     try {
       const match = content.match(/\{[\s\S]*\}$/);
       const jsonText = match ? match[0] : content;
       const parsed = JSON.parse(jsonText);
       return String(parsed.terms || "").trim();
     } catch (e) {
       throw new Error("AI şartlar oluşturma hatası");
     }
   }
   window.QuoteFlowAI = {
     getApiKey,
     setApiKey,
     getModel,
     setModel,
     suggestItems,
     rewriteEmail,
     refineItems,
     generateTerms,
     async supportChat(history, quote, userMessage) {
       const ctx = toContext(quote);
     const sys = buildSystem("support");
       const msgs = [{ role: "system", content: sys }];
       (history || []).forEach((m) => {
         if (m && m.role && m.content) msgs.push({ role: m.role, content: m.content });
       });
       msgs.push({ role: "user", content: JSON.stringify({ context: ctx, message: userMessage || "" }) });
       const configs = [
         { max_tokens: 500, model: getModel() },
         { max_tokens: 300, model: getModel() },
         { max_tokens: 300, model: "openai/gpt-4o-mini" },
         { max_tokens: 200, model: "openai/gpt-4o-mini" },
       ];
       let content = "";
       let lastErr = null;
       for (const cfg of configs) {
         try {
           content = await request(msgs, 0.7, cfg);
           if (content) break;
         } catch (e) {
           lastErr = e;
         }
       }
       if (!content && lastErr) throw lastErr;
       return String(content || "").trim();
     },
   };
 })();
