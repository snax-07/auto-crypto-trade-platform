export function validateOrder(symbolInfo, { price, qty, quoteOrderQty, type }) {
    const filters = symbolInfo.filters;
    const isMarket = type?.toUpperCase() === "MARKET";

    // 1. Quote Order Qty (Market Only)
    if (quoteOrderQty && Number(quoteOrderQty) > 0) {
        return validateQuoteOrderQty(symbolInfo, quoteOrderQty);
    }

    // 2. Quantity Based Orders
    if (qty && Number(qty) > 0) {
        if (!isMarket && (!price || Number(price) <= 0)) {
            return { ok: false, error: "LIMIT orders require a price." };
        }
        return quantityValidator(filters, price, qty, isMarket);
    }

    return { ok: false, error: "Order must include either Quantity or Total USDT." };
}

function quantityValidator(filters, price, qty, isMarket) {
    // 1. PRICE_FILTER (Only for LIMIT)
    if (!isMarket) {
        const priceRes = checkFilter(price, filters, "PRICE_FILTER", "minPrice", "maxPrice", "tickSize");
        if (!priceRes.ok) return { ok: false, error: `Price Error: ${priceRes.msg}` };
    }

    // 2. LOT_SIZE (For BOTH)
    const lotRes = checkFilter(qty, filters, "LOT_SIZE", "minQty", "maxQty", "stepSize");
    if (!lotRes.ok) return { ok: false, error: `Quantity Error: ${lotRes.msg}` };

    // 3. MIN_NOTIONAL
    const minNotionalRes = checkMinNotional(price, qty, filters);
    if (!minNotionalRes.ok) return minNotionalRes;

    return { ok: true };
}

/**
 * Robust check for TickSize and StepSize
 * Handles floating point inaccuracies by checking the remainder against a tiny epsilon
 */
function checkFilter(value, filters, filterType, minKey, maxKey, stepKey) {
    const f = filters.find(x => x.filterType === filterType);
    if (!f) return { ok: true };

    const val = Number(value);
    const min = Number(f[minKey]);
    const max = Number(f[maxKey]);
    const step = Number(f[stepKey]);

    if (val < min) return { ok: false, msg: `Value ${val} is below minimum ${min}` };
    if (val > max) return { ok: false, msg: `Value ${val} exceeds maximum ${max}` };

    // Use epsilon (1e-10) to ignore tiny rounding errors in JS
    // (val - min) / step should be an integer
    const remainder = (val - min) % step;
    const isInvalid = remainder > 0.00000001 && remainder < (step - 0.00000001);

    if (isInvalid) {
        return { ok: false, msg: `Value does not match required step/tick of ${step}` };
    }

    return { ok: true };
}

function checkMinNotional(price, qty, filters) {
    const f = filters.find(x => x.filterType === "MIN_NOTIONAL");
    if (!f) return { ok: true };

    const total = Number(price) * Number(qty);
    const min = Number(f.minNotional);

    if (total < min) {
        return { ok: false, error: `Total value (${total}) is below MIN_NOTIONAL (${min})` };
    }
    return { ok: true };
}

function validateQuoteOrderQty(symbolInfo, quoteOrderQty) {
    if (!symbolInfo.quoteOrderQtyMarketAllowed) {
        return { ok: false, error: "Total USDT orders not allowed for this pair." };
    }
    const minNotionalFilter = symbolInfo.filters.find(f => f.filterType === "MIN_NOTIONAL");
    if (minNotionalFilter && Number(quoteOrderQty) < Number(minNotionalFilter.minNotional)) {
        return { ok: false, error: "Total amount is below minimum notional value." };
    }
    return { ok: true };
}