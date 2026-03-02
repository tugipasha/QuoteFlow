 (function () {
   function getValidationErrors(q) {
     const errors = [];
     if (!q.company || !String(q.company.name || "").trim()) {
       errors.push("Firma adı zorunludur.");
     }
     const hasClient = (q.client && (q.client.company || q.client.name));
     if (!hasClient) {
       errors.push("Müşteri firma veya ilgili kişi zorunludur.");
     }
     const items = Array.isArray(q.items) ? q.items : [];
     if (!items.length) {
       errors.push("En az bir hizmet kalemi ekleyin.");
     } else {
       const invalid = items.some((i) => !String(i.title || "").trim() || !(Number(i.price) > 0));
       if (invalid) errors.push("Hizmet kalemlerinde başlık ve pozitif fiyat zorunludur.");
     }
     return errors;
   }
   window.QuoteFlowValidation = { getValidationErrors };
 })();
