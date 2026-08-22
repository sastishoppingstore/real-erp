// Convert a number to English words (whole part), e.g. 120268.15 ->
// "one hundred twenty thousand two hundred sixty eight"
const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function threeDigits(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h > 0) parts.push(ONES[h], "hundred");
  if (r > 0) {
    if (r < 20) parts.push(ONES[r]);
    else {
      const t = Math.floor(r / 10);
      const o = r % 10;
      parts.push(TENS[t] + (o ? "-" + ONES[o] : ""));
    }
  }
  return parts.join(" ");
}

export function numberToEnglishWords(value: number | string): string {
  const num = Math.floor(Math.abs(Number(value) || 0));
  if (num === 0) return "zero";
  const groups = [
    { div: 1_000_000_000, label: "billion" },
    { div: 1_000_000, label: "million" },
    { div: 1_000, label: "thousand" },
  ];
  let rest = num;
  const out: string[] = [];
  for (const g of groups) {
    const q = Math.floor(rest / g.div);
    rest %= g.div;
    if (q > 0) out.push(threeDigits(q), g.label);
  }
  if (rest > 0) out.push(threeDigits(rest));
  return out.join(" ").replace(/\s+/g, " ").trim();
}

export function formatMoney(n: number | string): string {
  const v = Number(n) || 0;
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
