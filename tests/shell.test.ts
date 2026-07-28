import assert from "node:assert/strict";
import test from "node:test";
import { KONAMI_SEQUENCE, KonamiDetector, ShellHistory, completeInput } from "../app/shell.ts";

test("shell history navigates backward and restores the draft", () => {
  const history = new ShellHistory();
  history.push("about");
  history.push("projects");
  assert.equal(history.previous("res"), "projects");
  assert.equal(history.previous(""), "about");
  assert.equal(history.next(), "projects");
  assert.equal(history.next(), "res");
});

test("tab completion resolves one match and exposes ambiguous matches", () => {
  assert.deepEqual(completeInput("who", ["whoami", "help"]), { value: "whoami", matches: ["whoami"] });
  assert.deepEqual(completeInput("theme ", ["theme light", "theme midnight"]), {
    value: "theme ",
    matches: ["theme light", "theme midnight"],
  });
});

test("Konami detector recognizes the classic sequence and resets", () => {
  const detector = new KonamiDetector();
  const results = KONAMI_SEQUENCE.map((key) => detector.push(key));
  assert.equal(results.at(-1), true);
  assert.equal(detector.push("x"), false);
});
