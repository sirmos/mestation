// Convert an Ethereum-style 0x address to the Bech32 "me1..." form
// (same 20 bytes, human-readable prefix "me"). No packages needed.
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function polymod(values) {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >>> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  const out = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

function checksum(hrp, data) {
  const mod = polymod(hrpExpand(hrp).concat(data, [0, 0, 0, 0, 0, 0])) ^ 1;
  const out = [];
  for (let i = 0; i < 6; i++) out.push((mod >>> (5 * (5 - i))) & 31);
  return out;
}

function convertBits(data, from, to) {
  let acc = 0;
  let bits = 0;
  const out = [];
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
  if (bits > 0) out.push((acc << (to - bits)) & maxv);
  return out;
}

function bech32Encode(hrp, data) {
  return hrp + "1" + data.concat(checksum(hrp, data)).map((d) => CHARSET[d]).join("");
}

function toMeAddress(hexAddress, hrp = "me") {
  const clean = hexAddress.toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]{40}$/.test(clean)) throw new Error("Not a valid 0x address");
  const bytes = [...Buffer.from(clean, "hex")];
  return bech32Encode(hrp, convertBits(bytes, 8, 5));
}

module.exports = { toMeAddress, bech32Encode, convertBits };

if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node scripts/toMeAddress.js 0xYourAddress");
    process.exit(1);
  }
  console.log(toMeAddress(input));
}