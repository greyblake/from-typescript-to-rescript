import Big from 'big.js';

function formatNearAmount(amount: Big): string {
    return formatNearWithPrecision(amount, 2);
}

function formatNearAmount4(amount: Big | string): string {
    return formatNearWithPrecision(amount, 4);
}

function formatNearWithPrecision(amount: Big | string, precision: number): string {
    const amountBig: Big = Big(amount);
    return `${amountBig.toFixed(precision)} Ⓝ `;
}

export { formatNearAmount, formatNearAmount4 }
