const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Lookup = new Map(
  [...base64Alphabet].map((character, index) => [character, index])
);

export function encodeUtf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const triplet = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);

    output += base64Alphabet[(triplet >> 18) & 63];
    output += base64Alphabet[(triplet >> 12) & 63];
    output += second === undefined ? "=" : base64Alphabet[(triplet >> 6) & 63];
    output += third === undefined ? "=" : base64Alphabet[triplet & 63];
  }

  return output;
}

export function decodeUtf8Base64(value: string): string {
  const normalized = value.replace(/\s/g, "");
  const bytes: number[] = [];

  for (let index = 0; index < normalized.length; index += 4) {
    const first = base64Lookup.get(normalized[index]);
    const second = base64Lookup.get(normalized[index + 1]);
    const third = normalized[index + 2] === "=" ? undefined : base64Lookup.get(normalized[index + 2]);
    const fourth = normalized[index + 3] === "=" ? undefined : base64Lookup.get(normalized[index + 3]);

    if (first === undefined || second === undefined) {
      throw new Error("INVALID_BASE64");
    }

    const triplet = (first << 18) | (second << 12) | ((third ?? 0) << 6) | (fourth ?? 0);
    bytes.push((triplet >> 16) & 255);

    if (third !== undefined) {
      bytes.push((triplet >> 8) & 255);
    }

    if (fourth !== undefined) {
      bytes.push(triplet & 255);
    }
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

export function encodeJsonDataUri(value: unknown): string {
  return `data:application/json;base64,${encodeUtf8Base64(JSON.stringify(value))}`;
}
