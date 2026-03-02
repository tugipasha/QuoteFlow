 (function () {
   const STORE = "quoteflow:chat";
   function readChat() {
     try {
       return JSON.parse(localStorage.getItem(STORE) || "[]");
     } catch {
       return [];
     }
   }
   function writeChat(h) {
     try {
       localStorage.setItem(STORE, JSON.stringify(h || []));
     } catch {}
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
   const container = createEl("div", { class: "support-chat-container" });
   const btn = createEl("button", { class: "support-chat-button" }, [document.createTextNode("Yardım Asistanı")]);
   const panel = createEl("div", { class: "support-chat-panel" });
   const header = createEl("div", { class: "support-chat-header" }, [
     createEl("div", { class: "support-chat-title" }, [document.createTextNode("Müşteri Hizmetleri (AI)")]),
     createEl("button", { class: "support-chat-close" }, [document.createTextNode("×")]),
   ]);
   const body = createEl("div", { class: "support-chat-body" });
   const footer = createEl("div", { class: "support-chat-footer" });
   const input = createEl("input", { class: "support-chat-input", type: "text", placeholder: "Sorunu yaz..." });
   const send = createEl("button", { class: "support-chat-send" }, [document.createTextNode("Gönder")]);
   footer.appendChild(input);
   footer.appendChild(send);
   panel.appendChild(header);
   panel.appendChild(body);
   panel.appendChild(footer);
   container.appendChild(btn);
   container.appendChild(panel);
   document.body.appendChild(container);
   function render(history) {
     body.innerHTML = "";
     (history || []).forEach((m) => {
       const bubble = createEl("div", { class: "support-chat-bubble " + (m.role === "user" ? "user" : "assistant") }, [
         document.createTextNode(m.content),
       ]);
       body.appendChild(bubble);
     });
     body.scrollTop = body.scrollHeight;
   }
   let history = readChat();
   render(history);
   function toggle(open) {
     panel.style.display = open ? "flex" : "none";
   }
   toggle(false);
   btn.addEventListener("click", () => toggle(true));
   header.lastChild.addEventListener("click", () => toggle(false));
   send.addEventListener("click", async () => {
     const text = input.value.trim();
     if (!text) return;
     history.push({ role: "user", content: text });
     render(history);
     input.value = "";
     const quote = loadQuote ? loadQuote() : null;
     const placeholder = { role: "assistant", content: "Yazıyor…" };
     history.push(placeholder);
     render(history);
     try {
       if (!window.QuoteFlowAI || !window.QuoteFlowAI.supportChat) {
         placeholder.content = "AI modülü mevcut değil.";
         render(history);
         return;
       }
       const reply = await window.QuoteFlowAI.supportChat(history.filter((m) => m !== placeholder), quote, text);
       placeholder.content = reply || "Yanıt alınamadı.";
       render(history);
       writeChat(history);
     } catch (e) {
       placeholder.content = "Hata: " + (e && e.message ? e.message : "bilinmiyor");
       render(history);
     }
   });
   input.addEventListener("keydown", (e) => {
     if (e.key === "Enter") send.click();
   });
 })();
