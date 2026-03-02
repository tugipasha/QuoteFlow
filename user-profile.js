 (function () {
   const KEY = "quoteflow:userProfile";
   function getProfile() {
     try {
       const raw = localStorage.getItem(KEY);
       if (!raw) return {};
       const p = JSON.parse(raw);
       return typeof p === "object" && p ? p : {};
     } catch {
       return {};
     }
   }
   function setProfile(p) {
     try {
       const safe = typeof p === "object" && p ? p : {};
       localStorage.setItem(KEY, JSON.stringify(safe));
     } catch {}
   }
   window.QuoteFlowUser = {
     getProfile,
     setProfile,
   };
 })();
