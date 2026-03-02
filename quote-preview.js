(function () {
  const root = document.getElementById("quotePreview");
  const btnPdf = document.getElementById("btnDownloadPdf");
  const btnEmail = document.getElementById("btnSendEmail");
  const btnAiEmail = document.getElementById("btnAiEmail");
  const btnShare = document.getElementById("btnSharePdf");

  const quote = loadQuote();
  const computed = calculateTotals(quote);

  function render() {
    if (!root) return;

    const q = computed;
    const hasData =
      q.company.name ||
      q.company.email ||
      q.company.phone ||
      q.client.name ||
      q.client.company ||
      (q.items && q.items.some((i) => i.title || i.price || i.qty));

    if (!hasData) {
      root.innerHTML =
        '<div class="empty-state"><strong>Henüz teklif verisi yok.</strong><br/>Önce Teklif Oluştur sayfasında formu doldurun.</div>';
      return;
    }

    const useOptional = !!q.includeOptional;
    const rowsHtml = (q.items || [])
      .filter((i) => i.title || i.price || i.qty)
      .map((i) => {
        const lineTotal = (Number(i.price) || 0) * (Number(i.qty) || 0);
        return `
          <tr>
            <td>${i.title || ""} ${i.optional ? '<span style="color:#9ca3af;">(opsiyonel)</span>' : ""}</td>
            <td>${formatCurrency(i.price)}</td>
            <td>${i.qty || 0}</td>
            <td>${i.optional && !useOptional ? formatCurrency(0) : formatCurrency(lineTotal)}</td>
          </tr>
        `;
      })
      .join("");

    root.innerHTML = `
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
        <div style="font-size:0.78rem; color:#6b7280;">
          ${q.client.name || ""}
        </div>
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
          ${
            rowsHtml ||
            '<tr><td colspan="4" style="padding:0.6rem 0.35rem; color:#9ca3af;">Hizmet kalemi ekleyin.</td></tr>'
          }
        </tbody>
      </table>
      <div class="preview-layout-totals">
        <div class="preview-layout-totals-row">
          <span>Ara toplam</span>
          <span>${formatCurrency(q.totals.subtotal)}</span>
        </div>
        <div class="preview-layout-totals-row">
          <span>KDV ${
            q.taxEnabled ? `(%${Math.round((q.taxRate || 0) * 100)})` : "(uygulanmıyor)"
          }</span>
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
          q.company && (q.company.bankName || q.company.iban)
            ? `<div style="margin-top:0.4rem;">
                 <div class="muted-label">Ödeme bilgileri</div>
                 <p style="margin-top:0.2rem;">${[(q.company.bankName || ""), (q.company.iban || "")].filter(Boolean).join(" • ")}</p>
               </div>`
            : ""
        }
      </div>
    `;
  }

  async function generatePdf() {
    if (!root) return;
    async function ensureLibs() {
      function load(src) {
        return new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (typeof html2canvas === "undefined") {
        await load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      }
      if (typeof window.jspdf === "undefined") {
        await load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      }
    }
    await ensureLibs().catch(() => {});
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
      alert("PDF için gerekli kütüphaneler yüklenemedi.");
      return;
    }
    let canvas;
    try {
      canvas = await html2canvas(root, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
    } catch (e) {
      alert("PDF oluşturulurken render hatası oluştu.");
      return;
    }
    const imgData = canvas.toDataURL("image/png");
    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight - margin * 2) {
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
    } else {
      const sliceHeightPx = Math.floor((pageHeight - margin * 2) * (canvas.height / imgHeight));
      let renderedPx = 0;
      while (renderedPx < canvas.height) {
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - renderedPx);
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          renderedPx,
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          sliceCanvas.width,
          sliceCanvas.height
        );
        const sliceImgData = sliceCanvas.toDataURL("image/png");
        if (renderedPx > 0) pdf.addPage();
        const sliceImgHeight = (sliceCanvas.height * imgWidth) / sliceCanvas.width;
        pdf.addImage(sliceImgData, "PNG", margin, margin, imgWidth, sliceImgHeight);
        renderedPx += sliceCanvas.height;
      }
    }

    const safeCompany = (computed.company.name || "teklif").replace(/[^\w\-]+/g, "-");
    pdf.save(`${safeCompany}-teklif.pdf`);
    try {
      const arr = JSON.parse(localStorage.getItem("quoteflow:analytics") || "[]");
      arr.push({ name: "pdf_generated", ts: Date.now() });
      localStorage.setItem("quoteflow:analytics", JSON.stringify(arr));
    } catch {}
  }

  async function buildPdfBlob() {
    if (!root) return null;
    await generatePdfLibs();
    const canvas = await html2canvas(root, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff" });
    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight <= pageHeight - margin * 2) {
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, imgWidth, imgHeight);
    } else {
      const sliceHeightPx = Math.floor((pageHeight - margin * 2) * (canvas.height / imgHeight));
      let renderedPx = 0;
      while (renderedPx < canvas.height) {
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - renderedPx);
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
        const sliceImgData = sliceCanvas.toDataURL("image/png");
        if (renderedPx > 0) pdf.addPage();
        const sliceImgHeight = (sliceCanvas.height * imgWidth) / sliceCanvas.width;
        pdf.addImage(sliceImgData, "PNG", margin, margin, imgWidth, sliceImgHeight);
        renderedPx += sliceCanvas.height;
      }
    }
    const blob = pdf.output("blob");
    return new File([blob], `${(computed.company.name || "teklif").replace(/[^\w\-]+/g, "-")}-teklif.pdf`, { type: "application/pdf" });
  }

  async function generatePdfLibs() {
    async function ensureLibs() {
      function load(src) {
        return new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = src;
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      if (typeof html2canvas === "undefined") {
        await load("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      }
      if (typeof window.jspdf === "undefined") {
        await load("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      }
    }
    await ensureLibs().catch(() => {});
  }

  function openEmailDraft() {
    const q = computed;
    const subject = encodeURIComponent(
      `${q.company.name || "Firma"} - Teklif (${formatCurrency(q.totals.total)})`
    );
    const intro = `Merhaba ${q.client.name || ""},\n\nAşağıda detaylarını paylaştığımız teklifimizi bilgilerinize sunarız.\n\n`;
    const lines =
      (q.items || [])
        .filter((i) => i.title)
        .map((i) => {
          const lineTotal = (Number(i.price) || 0) * (Number(i.qty) || 0);
          return `- ${i.title} (${i.qty || 0} x ${formatCurrency(i.price)}) = ${formatCurrency(
            lineTotal
          )}`;
        })
        .join("\n") || "- Hizmet kalemleri formda belirtilmiştir.";

    const outro = `\n\nAra toplam: ${formatCurrency(q.totals.subtotal)}\nKDV: ${formatCurrency(
      q.totals.tax
    )}\nGenel toplam: ${formatCurrency(q.totals.total)}\n\nİyi çalışmalar dileriz.\n${
      q.company.name || ""
    }`;

    const body = encodeURIComponent(intro + lines + outro);
    const to = encodeURIComponent(q.client.email || "");
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  render();

  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      generatePdf().catch((err) => {
        console.error("PDF oluşturma hatası", err);
        alert("PDF oluşturulurken bir hata oluştu.");
      });
    });
  }

  if (btnEmail) {
    btnEmail.addEventListener("click", openEmailDraft);
  }

  if (btnAiEmail) {
    btnAiEmail.addEventListener("click", async () => {
      try {
        if (!window.QuoteFlowAI || !window.QuoteFlowAI.rewriteEmail) {
          openEmailDraft();
          return;
        }
        btnAiEmail.disabled = true;
        const aiBody = await window.QuoteFlowAI.rewriteEmail(computed);
        const q = computed;
        const subject = encodeURIComponent(
          `${q.company.name || "Firma"} - Teklif (${formatCurrency(q.totals.total)})`
        );
        const to = encodeURIComponent(q.client.email || "");
        const body = encodeURIComponent(aiBody || "");
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      } catch (e) {
        openEmailDraft();
      } finally {
        btnAiEmail.disabled = false;
      }
    });
  }

  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      try {
        const file = await buildPdfBlob();
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Teklif PDF", text: "Teklif PDF'i ekte." });
        } else {
          await generatePdf();
          alert("Tarayıcınız dosya paylaşımını desteklemiyor. PDF indirildi, e‑posta ile ek olarak gönderin.");
        }
      } catch (e) {
        alert("Paylaşım sırasında hata oluştu.");
      }
    });
  }
})();

