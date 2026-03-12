
window.SP = window.SP || {};

SP.discounts = {
  findCode(code, codes) {
    const normalized = String(code || "").trim().toUpperCase();
    return codes.find((item) => item.active && item.code.toUpperCase() === normalized) || null;
  },
  calculate({ subtotal, totalQty, code, settings, codes }) {
    let discountPercent = 0;
    let discountValue = 0;
    let discountType = "none";
    let discountLabel = "";

    const matchingCode = this.findCode(code, codes || []);
    if (matchingCode && settings.discounts.discountCodePriority) {
      discountPercent = matchingCode.percent;
      discountValue = subtotal * (discountPercent / 100);
      discountType = "code";
      discountLabel = `${SP.t("codeDiscountLabel")} (${matchingCode.code})`;
    } else if (settings.discounts.sumDiscount.enabled && subtotal >= settings.discounts.sumDiscount.minAmount) {
      discountPercent = settings.discounts.sumDiscount.percent;
      discountValue = subtotal * (discountPercent / 100);
      discountType = "sum";
      discountLabel = SP.t("sumDiscountLabel");
    } else if (settings.discounts.countDiscount.enabled && totalQty >= settings.discounts.countDiscount.minItems) {
      discountPercent = settings.discounts.countDiscount.percent;
      discountValue = subtotal * (discountPercent / 100);
      discountType = "count";
      discountLabel = SP.t("countDiscountLabel");
    }

    const total = Math.max(0, subtotal - discountValue);

    return {
      matchingCode,
      subtotal,
      totalQty,
      discountType,
      discountLabel,
      discountPercent,
      discountValue,
      total
    };
  }
};
