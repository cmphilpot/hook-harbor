import { randomInt } from "node:crypto";

const DIGITS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~";

// 8 URL-safe characters, e.g. "XnsLjS2W". Uses crypto so IDs can't be guessed.
export const genId = () => {
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += DIGITS[randomInt(DIGITS.length)];
  }
  return id;
};
