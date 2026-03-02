 (function () {
   function log(name, data) {
     try {
       const raw = localStorage.getItem("quoteflow:analytics") || "[]";
       const arr = JSON.parse(raw);
       arr.push({ name, data: data || null, ts: Date.now() });
       localStorage.setItem("quoteflow:analytics", JSON.stringify(arr));
     } catch {}
   }
   function exportJson() {
     try {
       const raw = localStorage.getItem("quoteflow:analytics") || "[]";
       const blob = new Blob([raw], { type: "application/json" });
       const url = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = "quoteflow-analytics.json";
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
     } catch {}
   }
   window.QuoteFlowAnalytics = { log, exportJson };
 })();
