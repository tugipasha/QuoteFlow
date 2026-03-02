// Form sayfası (create.html) için mantık

(function () {
  const quote = loadQuote();

  const els = {
    companyName: document.getElementById("companyName"),
    companyEmail: document.getElementById("companyEmail"),
    companyPhone: document.getElementById("companyPhone"),
    companyLogo: document.getElementById("companyLogo"),
    bankName: document.getElementById("bankName"),
    iban: document.getElementById("iban"),
    brandColor: document.getElementById("brandColor"),
    quotePrefix: document.getElementById("quotePrefix"),
    quoteNumber: document.getElementById("quoteNumber"),
    btnSaveDefaults: document.getElementById("btnSaveDefaults"),
    btnApplyDefaults: document.getElementById("btnApplyDefaults"),
    clientName: document.getElementById("clientName"),
    clientCompany: document.getElementById("clientCompany"),
    clientEmail: document.getElementById("clientEmail"),
    clientSelect: document.getElementById("clientSelect"),
    btnSaveClient: document.getElementById("btnSaveClient"),
    itemsList: document.getElementById("itemsList"),
    btnAddItem: document.getElementById("btnAddItem"),
    subtotalDisplay: document.getElementById("subtotalDisplay"),
    taxDisplay: document.getElementById("taxDisplay"),
    totalDisplay: document.getElementById("totalDisplay"),
    taxEnabled: document.getElementById("taxEnabled"),
    taxRateLabel: document.getElementById("taxRateLabel"),
    taxRateInput: document.getElementById("taxRateInput"),
    currencySelect: document.getElementById("currencySelect"),
    includeOptional: document.getElementById("includeOptional"),
    validityDays: document.getElementById("validityDays"),
    termsText: document.getElementById("termsText"),
    btnAiTerms: document.getElementById("btnAiTerms"),
    livePreview: document.getElementById("livePreview"),
    btnResetQuote: document.getElementById("btnResetQuote"),
    aiPrompt: document.getElementById("aiPrompt"),
    btnAiSuggest: document.getElementById("btnAiSuggest"),
    btnSetApiKey: document.getElementById("btnSetApiKey"),
    btnAiRefine: document.getElementById("btnAiRefine"),
    aiStatus: document.getElementById("aiStatus"),
    btnExportQuote: document.getElementById("btnExportQuote"),
    btnImportQuote: document.getElementById("btnImportQuote"),
    fileImportQuote: document.getElementById("fileImportQuote"),
    aiSector: document.getElementById("aiSector"),
    aiTone: document.getElementById("aiTone"),
    aiCatalog: document.getElementById("aiCatalog"),
    aiPricing: document.getElementById("aiPricing"),
    btnSaveAiProfile: document.getElementById("btnSaveAiProfile"),
    btnFreelancerPreset: document.getElementById("btnFreelancerPreset"),
    btnInfluencerPreset: document.getElementById("btnInfluencerPreset"),
    influencerPlatform: document.getElementById("influencerPlatform"),
    influencerPosts: document.getElementById("influencerPosts"),
    influencerStories: document.getElementById("influencerStories"),
    influencerPostPrice: document.getElementById("influencerPostPrice"),
    influencerStoryPrice: document.getElementById("influencerStoryPrice"),
    btnInfluencerApply: document.getElementById("btnInfluencerApply"),
    userName: document.getElementById("userName"),
    userTitle: document.getElementById("userTitle"),
    userEmail: document.getElementById("userEmail"),
    userPhone: document.getElementById("userPhone"),
    userWebsite: document.getElementById("userWebsite"),
    btnSaveUserProfile: document.getElementById("btnSaveUserProfile"),
    btnFillCompanyFromUser: document.getElementById("btnFillCompanyFromUser"),
  };

  function bindInitialValues() {
    if (!els.companyName) return;
    els.companyName.value = quote.company.name || "";
    els.companyEmail.value = quote.company.email || "";
    els.companyPhone.value = quote.company.phone || "";
    if (els.bankName) els.bankName.value = quote.company.bankName || "";
    if (els.iban) els.iban.value = quote.company.iban || "";
    if (els.brandColor) els.brandColor.value = quote.brandColor || "#2563eb";
    if (els.quotePrefix) els.quotePrefix.value = quote.quotePrefix || "";
    if (els.quoteNumber) els.quoteNumber.value = quote.quoteNumber || "";
    els.clientName.value = quote.client.name || "";
    els.clientCompany.value = quote.client.company || "";
    if (els.clientEmail) {
      els.clientEmail.value = quote.client.email || "";
    }
    if (els.currencySelect) {
      els.currencySelect.value = quote.currency || "TRY";
    }
    if (els.includeOptional) {
      els.includeOptional.checked = !!quote.includeOptional;
    }
    if (els.validityDays) {
      els.validityDays.value = String(quote.validityDays || 15);
    }
    if (els.termsText) {
      els.termsText.value = quote.termsText || "";
    }
    if (els.clientSelect) {
      const raw = window.localStorage.getItem("quoteflow:clients");
      let list = [];
      try {
        list = JSON.parse(raw || "[]");
      } catch {}
      els.clientSelect.innerHTML = '<option value="">Seçiniz</option>';
      list.forEach((c, idx) => {
        const opt = document.createElement("option");
        opt.value = String(idx);
        opt.textContent = `${c.company || c.name || "Müşteri"} (${c.email || "-"})`;
        els.clientSelect.appendChild(opt);
      });
    }
    els.taxEnabled.checked = !!quote.taxEnabled;
    els.taxRateLabel.textContent = `(%${Math.round((quote.taxRate || 0) * 100)})`;
    if (els.taxRateInput) {
      els.taxRateInput.value = String(Math.round((quote.taxRate || 0) * 100));
    }
    renderItems();
    updateTotalsUI();
    renderPreview();
    if (window.QuoteFlowAI && window.QuoteFlowAI.getProfile) {
      const p = window.QuoteFlowAI.getProfile() || {};
      if (els.aiSector) els.aiSector.value = p.sector || "";
      if (els.aiTone) els.aiTone.value = p.tone || "Profesyonel, net ve Türkçe";
      if (els.aiCatalog) {
        const text = Array.isArray(p.catalog) ? p.catalog.join("; ") : (p.catalog || "");
        els.aiCatalog.value = text || "";
      }
      if (els.aiPricing) els.aiPricing.value = p.pricing || "";
    }
    if (window.QuoteFlowUser && window.QuoteFlowUser.getProfile) {
      const u = window.QuoteFlowUser.getProfile() || {};
      if (els.userName) els.userName.value = u.name || "";
      if (els.userTitle) els.userTitle.value = u.title || "";
      if (els.userEmail) els.userEmail.value = u.email || "";
      if (els.userPhone) els.userPhone.value = u.phone || "";
      if (els.userWebsite) els.userWebsite.value = u.website || "";
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      quote.company.logo = reader.result;
      persistAndRender();
    };
    reader.readAsDataURL(file);
  }

  function renderItems() {
    els.itemsList.innerHTML = "";
    if (!quote.items || !quote.items.length) {
      quote.items = [
        {
          title: "",
          price: 0,
          qty: 1,
          optional: false,
        },
      ];
    }

    quote.items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "item-row";

      const titleInput = document.createElement("input");
      titleInput.type = "text";
      titleInput.placeholder = "Hizmet / ürün adı";
      titleInput.value = item.title || "";
      titleInput.addEventListener("input", () => {
        quote.items[index].title = titleInput.value;
        persistAndRender();
      });

      const priceWrapper = document.createElement("div");
      priceWrapper.className = "input-inline";
      const pricePrefix = document.createElement("span");
      pricePrefix.className = "input-prefix";
      const cur = quote.currency || "TRY";
      pricePrefix.textContent = cur === "USD" ? "$" : cur === "EUR" ? "€" : "₺";
      const priceInput = document.createElement("input");
      priceInput.type = "number";
      priceInput.min = "0";
      priceInput.step = "0.01";
      priceInput.value = item.price != null ? item.price : "";
      priceInput.addEventListener("input", () => {
        quote.items[index].price = Number(priceInput.value || 0);
        persistAndRender();
      });
      priceWrapper.appendChild(pricePrefix);
      priceWrapper.appendChild(priceInput);

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "0";
      qtyInput.step = "1";
      qtyInput.value = item.qty != null ? item.qty : 1;
      qtyInput.addEventListener("input", () => {
        quote.items[index].qty = Number(qtyInput.value || 0);
        persistAndRender();
      });

      const optionalWrap = document.createElement("label");
      optionalWrap.style.display = "inline-flex";
      optionalWrap.style.alignItems = "center";
      optionalWrap.style.gap = "0.35rem";
      const optionalInput = document.createElement("input");
      optionalInput.type = "checkbox";
      optionalInput.checked = !!item.optional;
      optionalInput.addEventListener("change", () => {
        quote.items[index].optional = optionalInput.checked;
        persistAndRender();
      });
      const optionalText = document.createElement("span");
      optionalText.textContent = "Opsiyonel";
      optionalWrap.appendChild(optionalInput);
      optionalWrap.appendChild(optionalText);

      const amount = document.createElement("div");
      amount.className = "item-amount";
      const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
      amount.textContent = formatCurrency(lineTotal);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-icon";
      removeBtn.innerHTML = "×";
      removeBtn.title = "Satırı sil";
      removeBtn.addEventListener("click", () => {
        if (quote.items.length === 1) {
          quote.items[0] = { title: "", price: 0, qty: 1, optional: false };
        } else {
          quote.items.splice(index, 1);
        }
        persistAndRender();
      });

      row.appendChild(titleInput);
      row.appendChild(priceWrapper);
      row.appendChild(qtyInput);
      row.appendChild(optionalWrap);
      row.appendChild(amount);
      row.appendChild(removeBtn);

      els.itemsList.appendChild(row);
    });
  }

  function updateTotalsUI() {
    const withTotals = calculateTotals(quote);
    quote.totals = withTotals.totals;
    els.subtotalDisplay.textContent = formatCurrency(withTotals.totals.subtotal);
    els.taxDisplay.textContent = formatCurrency(withTotals.totals.tax);
    els.totalDisplay.textContent = formatCurrency(withTotals.totals.total);
  }

  function renderPreview() {
    const q = calculateTotals(quote);
    if (!els.livePreview) return;

    const hasData =
      q.company.name ||
      q.company.email ||
      q.company.phone ||
      q.client.name ||
      q.client.company ||
      q.client.email ||
      (q.items && q.items.some((i) => i.title || i.price || i.qty));

    if (!hasData) {
      els.livePreview.innerHTML =
        '<div class="empty-state"><strong>Henüz veri yok.</strong><br/>Soldaki formu doldurdukça teklif burada şekillenecek.</div>';
      return;
    }

    const rowsHtml = (q.items || [])
      .filter((i) => i.title || i.price || i.qty)
      .map((i) => {
        const lineTotal = (Number(i.price) || 0) * (Number(i.qty) || 0);
        return `
          <tr>
            <td>${i.title || ""} ${i.optional ? '<span style="color:#9ca3af;">(opsiyonel)</span>' : ""}</td>
            <td>${formatCurrency(i.price)}</td>
            <td>${i.qty || 0}</td>
            <td>${formatCurrency(lineTotal)}</td>
          </tr>
        `;
      })
      .join("");

    els.livePreview.innerHTML = `
      <div class="preview-layout-header">
        <div class="preview-layout-company-block">
          <div class="preview-layout-logo">
            ${
              q.company.logo
                ? `<img src="${q.company.logo}" alt="Logo" />`
                : '<span style="font-size:0.78rem; color:#64748b;">Logo</span>'
            }
          </div>
          <div>
            <div class="preview-layout-company-name">
              ${q.company.name || "Firma adınız"}
            </div>
            <div class="preview-layout-company-contact">
              ${q.company.email || ""}${
      q.company.email && q.company.phone ? " • " : ""
    }${q.company.phone || ""}
            </div>
          </div>
        </div>
        <div class="preview-layout-meta">
          <div class="preview-layout-title" style="color:${q.brandColor || "#111"}">Teklif</div>
          <div>${formatDate()}${q.quotePrefix || q.quoteNumber ? ` • #${[q.quotePrefix,q.quoteNumber].filter(Boolean).join("-")}` : ""}</div>
        </div>
      </div>
      <div class="preview-layout-client">
        <div class="muted-label">Müşteri</div>
        <div class="preview-layout-client-name">
          ${q.client.company || q.client.name || "Müşteri firması"}
        </div>
        ${
          q.client.name || q.client.email
            ? `<div style="font-size:0.78rem; color:#6b7280;">${[
                q.client.name,
                q.client.email,
              ]
                .filter(Boolean)
                .join(" • ")}</div>`
            : ""
        }
      </div>
      <table class="preview-layout-table">
        <thead>
          <tr>
            <th>Hizmet</th>
            <th>Birim fiyat</th>
            <th>Adet</th>
            <th>Tutar</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="4" style="padding:0.6rem 0.35rem; color:#9ca3af;">Hizmet kalemi ekleyin.</td></tr>'}
        </tbody>
      </table>
      <div class="preview-layout-totals">
        <div class="preview-layout-totals-row">
          <span>Ara toplam</span>
          <span>${formatCurrency(q.totals.subtotal)}</span>
        </div>
        <div class="preview-layout-totals-row">
          <span>KDV ${q.taxEnabled ? `(%${Math.round((q.taxRate || 0) * 100)})` : "(uygulanmıyor)"}</span>
          <span>${formatCurrency(q.totals.tax)}</span>
        </div>
        <div class="preview-layout-totals-row total">
          <span>Genel toplam</span>
          <span>${formatCurrency(q.totals.total)}</span>
        </div>
      </div>
      <div class="preview-layout-footer">
        <div class="muted-label">Not</div>
        <p style="margin-top:0.2rem;">
          Bu teklif ${formatDate()} tarihinden itibaren ${q.validityDays || 15} gün geçerlidir. Para birimi ${q.currency || "TRY"}.
        </p>
        ${
          q.termsText
            ? `<div style="margin-top:0.4rem;">
                 <div class="muted-label">Şartlar / Koşullar</div>
                 <p style="margin-top:0.2rem;">${q.termsText}</p>
               </div>`
            : ""
        }
        ${
          q.company.bankName || q.company.iban
            ? `<div style="margin-top:0.4rem;">
                 <div class="muted-label">Ödeme bilgileri</div>
                 <p style="margin-top:0.2rem;">${[q.company.bankName, q.company.iban].filter(Boolean).join(" • ")}</p>
               </div>`
            : ""
        }
      </div>
    `;
  }

  function persistAndRender() {
    const stored = saveQuote(quote);
    Object.assign(quote, stored);
    renderItems();
    updateTotalsUI();
    renderPreview();
  }

  function wireEvents() {
    if (!els.companyName) return;

    els.companyName.addEventListener("input", () => {
      quote.company.name = els.companyName.value;
      persistAndRender();
    });
    els.companyEmail.addEventListener("input", () => {
      quote.company.email = els.companyEmail.value;
      persistAndRender();
    });
    els.companyPhone.addEventListener("input", () => {
      quote.company.phone = els.companyPhone.value;
      persistAndRender();
    });
    if (els.bankName) {
      els.bankName.addEventListener("input", () => {
        quote.company.bankName = els.bankName.value;
        persistAndRender();
      });
    }
    if (els.iban) {
      els.iban.addEventListener("input", () => {
        quote.company.iban = els.iban.value;
        persistAndRender();
      });
    }
    if (els.brandColor) {
      els.brandColor.addEventListener("input", () => {
        quote.brandColor = els.brandColor.value;
        persistAndRender();
      });
    }
    els.clientName.addEventListener("input", () => {
      quote.client.name = els.clientName.value;
      persistAndRender();
    });
    els.clientCompany.addEventListener("input", () => {
      quote.client.company = els.clientCompany.value;
      persistAndRender();
    });
    if (els.clientEmail) {
      els.clientEmail.addEventListener("input", () => {
        quote.client.email = els.clientEmail.value;
        persistAndRender();
      });
    }
    if (els.clientSelect) {
      els.clientSelect.addEventListener("change", (e) => {
        const idx = Number(e.target.value);
        const raw = window.localStorage.getItem("quoteflow:clients");
        let list = [];
        try {
          list = JSON.parse(raw || "[]");
        } catch {}
        const picked = list[idx];
        if (picked) {
          quote.client = {
            name: picked.name || "",
            company: picked.company || "",
            email: picked.email || "",
          };
          persistAndRender();
        }
      });
    }
    if (els.btnSaveClient) {
      els.btnSaveClient.addEventListener("click", () => {
        const raw = window.localStorage.getItem("quoteflow:clients");
        let list = [];
        try {
          list = JSON.parse(raw || "[]");
        } catch {}
        const entry = {
          name: quote.client.name || "",
          company: quote.client.company || "",
          email: quote.client.email || "",
        };
        list.push(entry);
        window.localStorage.setItem("quoteflow:clients", JSON.stringify(list));
        bindInitialValues();
      });
    }
    els.companyLogo.addEventListener("change", handleLogoChange);
    if (els.quotePrefix) {
      els.quotePrefix.addEventListener("input", () => {
        quote.quotePrefix = els.quotePrefix.value;
        persistAndRender();
      });
    }
    if (els.quoteNumber) {
      els.quoteNumber.addEventListener("input", () => {
        quote.quoteNumber = els.quoteNumber.value;
        persistAndRender();
      });
    }
    if (els.btnSaveDefaults) {
      els.btnSaveDefaults.addEventListener("click", () => {
        const defaults = {
          company: quote.company,
          brandColor: quote.brandColor,
          currency: quote.currency,
          locale: quote.locale,
          taxEnabled: quote.taxEnabled,
          taxRate: quote.taxRate,
          validityDays: quote.validityDays,
          quotePrefix: quote.quotePrefix,
        };
        window.localStorage.setItem("quoteflow:defaults", JSON.stringify(defaults));
        if (els.aiStatus) els.aiStatus.textContent = "Varsayılanlar kaydedildi.";
      });
    }
    if (els.btnApplyDefaults) {
      els.btnApplyDefaults.addEventListener("click", () => {
        const raw = window.localStorage.getItem("quoteflow:defaults");
        if (!raw) return;
        try {
          const d = JSON.parse(raw);
          quote.company = { ...quote.company, ...(d.company || {}) };
          quote.brandColor = d.brandColor || quote.brandColor;
          quote.currency = d.currency || quote.currency;
          quote.locale = d.locale || quote.locale;
          quote.taxEnabled = typeof d.taxEnabled === "boolean" ? d.taxEnabled : quote.taxEnabled;
          quote.taxRate = typeof d.taxRate === "number" ? d.taxRate : quote.taxRate;
          quote.validityDays = typeof d.validityDays === "number" ? d.validityDays : quote.validityDays;
          quote.quotePrefix = d.quotePrefix || quote.quotePrefix;
          bindInitialValues();
          persistAndRender();
          if (els.aiStatus) els.aiStatus.textContent = "Varsayılanlar uygulandı.";
        } catch {}
      });
    }

    els.taxEnabled.addEventListener("change", () => {
      quote.taxEnabled = els.taxEnabled.checked;
      persistAndRender();
    });
    if (els.taxRateInput) {
      els.taxRateInput.addEventListener("input", () => {
        const v = Number(els.taxRateInput.value || 0);
        const pct = Math.max(0, Math.min(100, v));
        quote.taxRate = pct / 100;
        els.taxRateLabel.textContent = `(%${Math.round(pct)})`;
        persistAndRender();
      });
    }
    if (els.currencySelect) {
      els.currencySelect.addEventListener("change", () => {
        const cur = els.currencySelect.value || "TRY";
        quote.currency = cur;
        quote.locale = cur === "USD" ? "en-US" : cur === "EUR" ? "de-DE" : "tr-TR";
        persistAndRender();
      });
    }
    if (els.includeOptional) {
      els.includeOptional.addEventListener("change", () => {
        quote.includeOptional = els.includeOptional.checked;
        persistAndRender();
      });
    }
    if (els.validityDays) {
      els.validityDays.addEventListener("input", () => {
        const v = Math.max(1, Math.min(365, Number(els.validityDays.value || 15)));
        quote.validityDays = v;
        persistAndRender();
      });
    }
    if (els.termsText) {
      els.termsText.addEventListener("input", () => {
        quote.termsText = els.termsText.value;
        persistAndRender();
      });
    }
    if (els.btnAiTerms) {
      els.btnAiTerms.addEventListener("click", async () => {
        if (!window.QuoteFlowAI || !window.QuoteFlowAI.generateTerms) {
          if (els.aiStatus) els.aiStatus.textContent = "AI modülü yüklenemedi.";
          return;
        }
        els.btnAiTerms.disabled = true;
        if (els.aiStatus) els.aiStatus.textContent = "AI çalışıyor…";
        try {
          const text = await window.QuoteFlowAI.generateTerms(quote);
          quote.termsText = text || quote.termsText;
          persistAndRender();
          if (els.aiStatus) els.aiStatus.textContent = "Şartlar eklendi.";
        } catch (e) {
          if (els.aiStatus) els.aiStatus.textContent = "Hata: " + (e && e.message ? e.message : "bilinmiyor");
        } finally {
          els.btnAiTerms.disabled = false;
        }
      });
    }

    if (els.btnAddItem) {
      els.btnAddItem.addEventListener("click", () => {
        quote.items.push({
          title: "",
          price: 0,
          qty: 1,
        });
        persistAndRender();
      });
    }

    if (els.btnResetQuote) {
      els.btnResetQuote.addEventListener("click", () => {
        if (!window.confirm("Bu teklifi sıfırlamak istediğine emin misin?")) return;
        const fresh = createEmptyQuote();
        const stored = saveQuote(fresh);
        Object.assign(quote, stored);
        bindInitialValues();
      });
    }

    if (els.btnSetApiKey) {
      els.btnSetApiKey.addEventListener("click", () => {
        const current = (window.QuoteFlowAI && window.QuoteFlowAI.getApiKey && window.QuoteFlowAI.getApiKey()) || "";
        const key = window.prompt("OpenRouter API anahtarı (sk-or-v1-...)", current || "");
        if (key && window.QuoteFlowAI && window.QuoteFlowAI.setApiKey) {
          window.QuoteFlowAI.setApiKey(key);
          if (els.aiStatus) els.aiStatus.textContent = "API anahtarı kaydedildi.";
        }
      });
    }

    if (els.btnAiSuggest) {
      els.btnAiSuggest.addEventListener("click", async () => {
        if (!window.QuoteFlowAI || !window.QuoteFlowAI.suggestItems) {
          if (els.aiStatus) els.aiStatus.textContent = "AI modülü yüklenemedi.";
          return;
        }
        const prompt = (els.aiPrompt && els.aiPrompt.value) || "";
        els.btnAiSuggest.disabled = true;
        if (els.aiStatus) els.aiStatus.textContent = "AI çalışıyor…";
        try {
          const items = await window.QuoteFlowAI.suggestItems(quote, prompt);
          if (Array.isArray(items) && items.length) {
            quote.items = items;
            persistAndRender();
            if (els.aiStatus) els.aiStatus.textContent = "AI önerileri eklendi.";
          } else {
            if (els.aiStatus) els.aiStatus.textContent = "Öneri alınamadı.";
          }
        } catch (e) {
          if (els.aiStatus) els.aiStatus.textContent = "Hata: " + (e && e.message ? e.message : "bilinmiyor");
        } finally {
          els.btnAiSuggest.disabled = false;
        }
      });
    }
    if (els.btnAiRefine) {
      els.btnAiRefine.addEventListener("click", async () => {
        if (!window.QuoteFlowAI || !window.QuoteFlowAI.refineItems) {
          if (els.aiStatus) els.aiStatus.textContent = "AI modülü yüklenemedi.";
          return;
        }
        els.btnAiRefine.disabled = true;
        if (els.aiStatus) els.aiStatus.textContent = "AI çalışıyor…";
        try {
          const items = await window.QuoteFlowAI.refineItems(quote);
          if (Array.isArray(items) && items.length) {
            quote.items = items;
            persistAndRender();
            if (els.aiStatus) els.aiStatus.textContent = "AI optimizasyonu uygulandı.";
          } else {
            if (els.aiStatus) els.aiStatus.textContent = "Optimizasyon yapılamadı.";
          }
        } catch (e) {
          if (els.aiStatus) els.aiStatus.textContent = "Hata: " + (e && e.message ? e.message : "bilinmiyor");
        } finally {
          els.btnAiRefine.disabled = false;
        }
      });
    }
    if (els.btnSaveAiProfile) {
      els.btnSaveAiProfile.addEventListener("click", () => {
        const catalogRaw = (els.aiCatalog && els.aiCatalog.value) || "";
        const catalog =
          catalogRaw
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean) || [];
        const profile = {
          sector: (els.aiSector && els.aiSector.value) || "",
          tone: (els.aiTone && els.aiTone.value) || "Profesyonel, net ve Türkçe",
          catalog,
          pricing: (els.aiPricing && els.aiPricing.value) || "",
        };
        if (window.QuoteFlowAI && window.QuoteFlowAI.setProfile) {
          window.QuoteFlowAI.setProfile(profile);
          if (els.aiStatus) els.aiStatus.textContent = "AI profili kaydedildi.";
        }
      });
    }
    if (els.btnFreelancerPreset) {
      els.btnFreelancerPreset.addEventListener("click", () => {
        const preset = {
          sector: "Freelancer hizmetleri (web tasarım, yazılım, danışmanlık)",
          tone: "Profesyonel ve teknik, net ve Türkçe",
          catalog: ["Kurumsal web sitesi", "Bakım & destek (aylık)", "Landing page", "SEO teknik iyileştirme", "Eğitim / workshop"],
          pricing: "Web tasarım 20–60 bin TL; landing 8–25 bin TL; bakım aylık 500–2500 TL; eğitim/gün 3–10 bin TL",
        };
        if (els.aiSector) els.aiSector.value = preset.sector;
        if (els.aiTone) els.aiTone.value = preset.tone;
        if (els.aiCatalog) els.aiCatalog.value = preset.catalog.join("; ");
        if (els.aiPricing) els.aiPricing.value = preset.pricing;
        if (window.QuoteFlowAI && window.QuoteFlowAI.setProfile) {
          window.QuoteFlowAI.setProfile(preset);
        }
        if (els.aiStatus) els.aiStatus.textContent = "Freelancer profili uygulandı.";
      });
    }
    if (els.btnInfluencerPreset) {
      els.btnInfluencerPreset.addEventListener("click", () => {
        const preset = {
          sector: "Influencer içerik üretimi (Instagram, TikTok, YouTube)",
          tone: "Kısa ve net; teknik/lojistik odaklı; Türkçe",
          catalog: ["Instagram post", "Instagram story", "Instagram reel", "TikTok video", "YouTube video", "Short"],
          pricing: "Post/video 5–25 bin TL; story/reel/short 1–6 bin TL; paket indirimi mümkün",
        };
        if (els.aiSector) els.aiSector.value = preset.sector;
        if (els.aiTone) els.aiTone.value = preset.tone;
        if (els.aiCatalog) els.aiCatalog.value = preset.catalog.join("; ");
        if (els.aiPricing) els.aiPricing.value = preset.pricing;
        if (window.QuoteFlowAI && window.QuoteFlowAI.setProfile) {
          window.QuoteFlowAI.setProfile(preset);
        }
        if (els.aiStatus) els.aiStatus.textContent = "Influencer profili uygulandı.";
      });
    }
    if (els.btnInfluencerApply) {
      els.btnInfluencerApply.addEventListener("click", () => {
        const platform = (els.influencerPlatform && els.influencerPlatform.value) || "instagram";
        const posts = Math.max(0, Math.floor(Number((els.influencerPosts && els.influencerPosts.value) || 0)));
        const stories = Math.max(0, Math.floor(Number((els.influencerStories && els.influencerStories.value) || 0)));
        const postPrice = Math.max(0, Number((els.influencerPostPrice && els.influencerPostPrice.value) || 0));
        const storyPrice = Math.max(0, Number((els.influencerStoryPrice && els.influencerStoryPrice.value) || 0));
        const items = [];
        function add(title, qty, price) {
          if (qty > 0 && price > 0) items.push({ title, qty, price, optional: false });
        }
        if (platform === "instagram") {
          add("Instagram Post", posts, postPrice);
          add("Instagram Story", stories, storyPrice);
          add("Instagram Reel", stories, storyPrice);
        } else if (platform === "tiktok") {
          add("TikTok Video", posts, postPrice);
          add("TikTok Short", stories, storyPrice);
        } else {
          add("YouTube Video", posts, postPrice);
          add("YouTube Short", stories, storyPrice);
        }
        if (items.length) {
          quote.items = items;
          persistAndRender();
          if (els.aiStatus) els.aiStatus.textContent = "Influencer paketi uygulandı.";
        } else {
          if (els.aiStatus) els.aiStatus.textContent = "Geçerli adet/fiyat girin.";
        }
      });
    }
    if (els.btnSaveUserProfile) {
      els.btnSaveUserProfile.addEventListener("click", () => {
        const profile = {
          name: (els.userName && els.userName.value) || "",
          title: (els.userTitle && els.userTitle.value) || "",
          email: (els.userEmail && els.userEmail.value) || "",
          phone: (els.userPhone && els.userPhone.value) || "",
          website: (els.userWebsite && els.userWebsite.value) || "",
        };
        if (window.QuoteFlowUser && window.QuoteFlowUser.setProfile) {
          window.QuoteFlowUser.setProfile(profile);
          if (els.aiStatus) els.aiStatus.textContent = "Kullanıcı profili kaydedildi.";
        }
      });
    }
    if (els.btnFillCompanyFromUser) {
      els.btnFillCompanyFromUser.addEventListener("click", () => {
        if (!window.QuoteFlowUser || !window.QuoteFlowUser.getProfile) return;
        const u = window.QuoteFlowUser.getProfile() || {};
        if (u.email && els.companyEmail) els.companyEmail.value = u.email;
        if (u.phone && els.companyPhone) els.companyPhone.value = u.phone;
        quote.company.email = u.email || quote.company.email;
        quote.company.phone = u.phone || quote.company.phone;
        persistAndRender();
      });
    }
    if (els.btnExportQuote) {
      els.btnExportQuote.addEventListener("click", () => {
        const data = JSON.stringify(calculateTotals(quote), null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeCompany = (quote.company && quote.company.name ? quote.company.name : "teklif").replace(/[^\w\-]+/g, "-");
        a.href = url;
        a.download = `${safeCompany}-quoteflow.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }
    if (els.btnImportQuote && els.fileImportQuote) {
      els.btnImportQuote.addEventListener("click", () => {
        els.fileImportQuote.click();
      });
      els.fileImportQuote.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result || "{}"));
            const stored = saveQuote(parsed);
            Object.assign(quote, stored);
            bindInitialValues();
          } catch {
          }
        };
        reader.readAsText(file, "utf-8");
      });
    }
  }

  bindInitialValues();
  wireEvents();
})();

