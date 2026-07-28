import assert from "node:assert/strict";
import test from "node:test";
import { runCommand } from "../app/terminal.ts";

test("commands ignore surrounding whitespace and casing", () => {
  const result = runCommand("  AbOuT  ");
  assert.equal(result.kind, "content");
  assert.equal(result.command, "about");
});

test("clear returns a distinct action", () => {
  assert.deepEqual(runCommand("clear"), { kind: "clear", command: "clear" });
});

test("unknown commands offer a useful recovery path", () => {
  const result = runCommand("dance");
  assert.equal(result.kind, "content");
  assert.match(result.lines[0], /help/i);
});

test("terminal-style aliases resolve to portfolio sections", () => {
  assert.equal(runCommand("whoami").title, "Hello, I’m Katy.");
  assert.equal(runCommand("open projects").title, "Things I’ve made");
  assert.equal(runCommand("cat resume").title, "Katy Henning — Software Engineer");
  assert.equal(runCommand("ls").command, "ls");
});

test("projects combine migrated work with GitHub repositories", () => {
  const result = runCommand("projects");
  assert.equal(result.kind, "content");
  assert.equal(result.projects?.length, 6);
  assert.equal(result.repositories?.length, 3);
  assert.ok(result.projects?.every((project) => project.role && project.stack.length && project.outcome));
  assert.match(result.repositories?.[0].href ?? "", /github\.com\/KatyCodes/);
});

test("resume exposes the complete scrollable resume content", () => {
  const result = runCommand("resume");
  assert.equal(result.kind, "content");
  assert.ok(result.resume);
  assert.equal(result.resume?.length, 5);
  assert.match(JSON.stringify(result.resume), /Music Fights Fraud Alliance/);
  assert.match(JSON.stringify(result.resume), /University of Oregon/);
  assert.ok(result.links?.some((link) => link.href.endsWith(".pdf")));
});

test("theme commands expose an explicit visual mode", () => {
  assert.equal(runCommand("theme midnight").theme, "midnight");
  assert.equal(runCommand("theme light").theme, "light");
});

test("authentic shell commands return portfolio-specific output", () => {
  assert.match(runCommand("man katy").lines.join(" "), /full-stack software engineer/i);
  assert.match(runCommand("uname -a").lines.join(" "), /KatyCodes/);
  assert.match(runCommand("git log --oneline").lines.join(" "), /portfolio v2/i);
});

test("secret commands reveal Easter eggs", () => {
  assert.match(runCommand("sudo hire katy").title ?? "", /permission granted/i);
  assert.match(runCommand("coffee").lines.join(" "), /coffee/i);
  assert.match(runCommand("click").title ?? "", /clicked/i);
});

test("snake command launches the browser game", () => {
  assert.equal(runCommand("snake").game, "snake");
});

test("games command provides visible launchers for every game", () => {
  const games = runCommand("games");
  assert.equal(games.title, "Katy’s Arcade");
  assert.deepEqual(games.links?.map((link) => link.href), ["#snake", "#geography"]);
});
