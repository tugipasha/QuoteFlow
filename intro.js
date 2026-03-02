 (function () {
   const KEY = "quoteflow:intro:dismissed";
   function dismissed() {
     return localStorage.getItem(KEY) === "1";
   }
   function setDismissed() {
     localStorage.setItem(KEY, "1");
   }
   function createEl(tag, attrs, children) {
     const el = document.createElement(tag);
     Object.entries(attrs || {}).forEach(([k, v]) => {
       if (k === "class") el.className = v;
       else el.setAttribute(k, v);
     });
     (children || []).forEach((c) => el.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
     return el;
   }
   if (dismissed()) return;
   const overlay = createEl("div", { class: "intro-overlay" });
   const modal = createEl("div", { class: "intro-modal" });
   const title = createEl("div", { class: "intro-title" }, [document.createTextNode("Hoş geldin! Teklifini birlikte hazırlayalım.")]);
   const desc = createEl("div", { class: "intro-desc" }, [
     document.createTextNode("1) Firma ve müşteri bilgilerini doldur. 2) AI ile kalemleri üret veya optimize et. 3) Önizlemeden PDF indir."),
   ]);
   const actions = createEl("div", { class: "intro-actions" });
   const btnStart = createEl("button", { class: "btn btn-primary" }, [document.createTextNode("Hızlı Başla")]);
   const btnPreset = createEl("button", { class: "btn btn-secondary" }, [document.createTextNode("Freelancer profili uygula")]);
   const btnAI = createEl("button", { class: "btn btn-ghost" }, [document.createTextNode("AI ayarlarını aç")]);
   actions.appendChild(btnStart);
   actions.appendChild(btnPreset);
   actions.appendChild(btnAI);
   const close = createEl("button", { class: "intro-close" }, [document.createTextNode("×")]);
   modal.appendChild(close);
   modal.appendChild(title);
   modal.appendChild(desc);
   modal.appendChild(actions);
   overlay.appendChild(modal);
   document.body.appendChild(overlay);
   function hide() {
     overlay.remove();
     setDismissed();
   }
   btnStart.addEventListener("click", hide);
   close.addEventListener("click", hide);
   btnPreset.addEventListener("click", () => {
     const el = document.getElementById("btnFreelancerPreset");
     if (el) el.click();
     hide();
   });
   btnAI.addEventListener("click", () => {
     const el = document.getElementById("btnSetApiKey");
     if (el) el.click();
     hide();
   });
 })();
