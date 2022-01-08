let formatNearWithPrecision = (amount: Big.t, precision: int): string => {
  let fixedAmount = Big.toFixed(amount, precision)
  `${fixedAmount} Ⓝ `
}

let formatNearAmount = amount => formatNearWithPrecision(amount, 2)

let formatNearAmount4 = amount => formatNearWithPrecision(amount, 4)
