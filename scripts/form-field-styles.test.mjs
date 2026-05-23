import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globalsCss = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("global form field styles keep entered text visible", () => {
  assert.match(
    globalsCss,
    /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\):not\(\[type="range"\]\),\s*textarea,\s*select/,
  );
  assert.match(globalsCss, /text-primaryText/);
  assert.match(globalsCss, /placeholder:text-secondaryText\/75/);
  assert.match(globalsCss, /caret-worldCupBlue/);
  assert.match(globalsCss, /bg-base/);
  assert.match(globalsCss, /focus[\s\S]*ring-worldCupBlue/);
});

test("global form field styles cover autofill and inactive states", () => {
  assert.match(globalsCss, /:-webkit-autofill/);
  assert.match(globalsCss, /-webkit-text-fill-color:\s*#111111/);
  assert.match(globalsCss, /caret-color:\s*#1b4dff/);
  assert.match(globalsCss, /:disabled/);
  assert.match(globalsCss, /:read-only/);
  assert.match(globalsCss, /text-secondaryText/);
  assert.match(globalsCss, /opacity-100/);
});
