import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { runCommand } from "../app/terminal.ts";

const projectRoot = new URL("../", import.meta.url);
const publicRoot = new URL("../public/", import.meta.url);

function localTargets(markup: string) {
  return [...markup.matchAll(/(?:href|src)="(\/[^"]+)"/g)]
    .map((match) => match[1])
    .filter((path) => path !== "/" && !path.startsWith("/app/"));
}

test("every static page link and asset resolves locally", () => {
  for (const page of ["index.html", "public/404.html"]) {
    const markup = readFileSync(new URL(page, projectRoot), "utf8");
    for (const target of localTargets(markup)) {
      assert.ok(existsSync(new URL(target.slice(1), publicRoot)), `${page}: ${target} should exist`);
    }
  }
});

test("every portfolio screenshot and résumé download exists", () => {
  const projects = runCommand("projects");
  const resume = runCommand("resume");
  assert.equal(projects.kind, "content");
  assert.equal(resume.kind, "content");
  if (projects.kind === "content") {
    for (const project of projects.projects ?? []) {
      assert.ok(existsSync(new URL(project.image.slice(1), publicRoot)), project.image);
    }
  }
  if (resume.kind === "content") {
    for (const link of resume.links ?? []) {
      assert.ok(existsSync(new URL(link.href.slice(1), publicRoot)), link.href);
    }
  }
});
