// Convert between Ethereum-style 0x addresses and the Bech32 "me1..." form
// used by Meta Earth. Both are encodings of the same 20 bytes.
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >>> i) & 1) chk ^= GENERATORS[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const out: number[] = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

function createChecksum(hrp: string, data: number[]): number[] {
  const mod = polymod(hrpExpand(hrp).concat(data, [0, 0, 0, 0, 0, 0])) ^ 1;
  const out: number[] = [];
  for (let i = 0; i < 6; i++) out.push((mod >>> (5 * (5 - i))) & 31);
  return out;
}

function convertBits(data: number[], from: number, to: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  const maxv = (1 << to) - 1;
  for (const value of data) {
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >>> bits) & maxv);
    }
    acc &= (1 << bits) - 1;
  }
  if (pad) {
    if (bits > 0) out.push((acc << (to - bits)) & maxv);
  } else if (bits >= from || acc !== 0) {
    throw new Error("Invalid address length");
  }
  return out;
}

export function isEvmAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim());
}

/** 0x... to me1... */
export function toMeAddress(address: string, hrp = "me"): string {
  const clean = address.trim();
  if (!isEvmAddress(clean)) throw new Error("Not a valid 0x address");
  const hex = clean.slice(2);
  const bytes: number[] = [];
  for (let i = 0; i < 40; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  const data = convertBits(bytes, 8, 5, true);
  const all = data.concat(createChecksum(hrp, data));
  return hrp + "1" + all.map((d) => CHARSET[d]).join("");
}

/** me1... to 0x... (lowercase) */
export function fromMeAddress(address: string, hrp = "me"): string {
  const lower = address.trim().toLowerCase();
  const sep = lower.lastIndexOf("1");
  if (sep < 1 || lower.slice(0, sep) !== hrp) {
    throw new Error(`Address must start with ${hrp}1`);
  }
  const values: number[] = [];
  for (const ch of lower.slice(sep + 1)) {
    const v = CHARSET.indexOf(ch);
    if (v === -1) throw new Error("Invalid character in address");
    values.push(v);
  }
  if (values.length < 7) throw new Error("Address is too short");
  if (polymod(hrpExpand(hrp).concat(values)) !== 1) throw new Error("Bad checksum");
  const bytes = convertBits(values.slice(0, -6), 5, 8, false);
  if (bytes.length !== 20) throw new Error("Not a 20-byte address");
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}