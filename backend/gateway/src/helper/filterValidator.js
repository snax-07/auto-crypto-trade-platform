import getExchnageInfo from "./exchange-info.js";

export function validateOrder(symbolInfo, { price, qty, quoteOrderQty, type }) {
    const filters = symbolInfo.filters;

    if (quoteOrderQty !== undefined && quoteOrderQty !== null) {
        const result = validateQuoteOrderQty(symbolInfo, quoteOrderQty);
        return result;
    }

    if (qty !== undefined && qty !== null) {
        const result = quantityValidator(filters, price, qty);
        return result;
    }

    return { ok: false, error: "No valid order parameters provided." };
}


function quantityValidator(filters , price , qty ){

    if (!checkPriceFilter(price, filters))
        return { ok: false, error: "PRICE_FILTER failed" };

    if (!checkLotSize(qty, filters))
        return { ok: false, error: "LOT_SIZE failed" };

    if (!checkMinNotional(price, qty, filters))
        return { ok: false, error: "MIN_NOTIONAL failed" };

    return { ok: true };
}

function checkPriceFilter(price, filters) {
    const f = filters.find(x => x.filterType === "PRICE_FILTER");
    if (!f) return true;

    const p = Number(price);
    const min = Number(f.minPrice);
    const max = Number(f.maxPrice);
    const tick = Number(f.tickSize);

    if (p < min || p > max) return false;

    const normalized = ((p - min) / tick).toFixed(12);
    return Number(normalized) % 1 === 0;
}

function checkLotSize(qty, filters) {
    const f = filters.find(x => x.filterType === "LOT_SIZE");
    if (!f) return true;

    const q = Number(qty);
    const min = Number(f.minQty);
    const max = Number(f.maxQty);
    const step = Number(f.stepSize);

    if (q < min || q > max) return false;

    const normalized = ((q - min) / step).toFixed(12);
    return Number(normalized) % 1 === 0;
}

function checkMinNotional(price, qty, filters) {
    const f = filters.find(x => x.filterType === "MIN_NOTIONAL");
    if (!f) return true;

    const notional = Number(price) * Number(qty);
    return notional >= Number(f.minNotional);
}



function validateQuoteOrderQty(symbolInfo, quoteOrderQty) {
    const filters = symbolInfo.filters;

    if (!symbolInfo.quoteOrderQtyMarketAllowed) {
        return { ok: false, error: "QUOTE_ORDER_QTY not allowed for this symbol" };
    }

    if (isNaN(Number(quoteOrderQty)) || Number(quoteOrderQty) <= 0) {
        return { ok: false, error: "Invalid quoteOrderQty value" };
    }

    const minNotionalFilter = filters.find(f => f.filterType === "MIN_NOTIONAL");
    if (minNotionalFilter) {
        if (Number(quoteOrderQty) < Number(minNotionalFilter.minNotional)) {
            return { ok: false, error: "MIN_NOTIONAL failed" };
        }
    }

    return { ok: true };
}
