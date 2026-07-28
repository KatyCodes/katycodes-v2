import "./globals.css";
import { COMPLETIONS, PRIMARY_COMMANDS, runCommand, type CommandResult } from "./terminal";
import { KonamiDetector, ShellHistory, completeInput } from "./shell";
import { GeographyGame } from "./geography";
import { SnakeGame, type Direction } from "./snake";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import type { Feature, FeatureCollection, Geometry } from "geojson";

type CountryProperties = { name: string };
type CountryFeature = Feature<Geometry, CountryProperties>;

const history = document.querySelector<HTMLDivElement>("#history")!;
const menu = document.querySelector<HTMLElement>("#command-menu")!;
const form = document.querySelector<HTMLFormElement>("#command-form")!;
const input = document.querySelector<HTMLInputElement>("#command")!;
const clickTrigger = document.querySelector<HTMLButtonElement>("#click-trigger")!;
const konamiToast = document.querySelector<HTMLDivElement>("#konami-toast")!;
const announcer = document.querySelector<HTMLDivElement>("#terminal-announcer")!;
const terminalBody = document.querySelector<HTMLElement>("#terminal-body")!;
const terminalConsole = document.querySelector<HTMLElement>(".terminal-console")!;
const terminalWindowTitle = document.querySelector<HTMLElement>("#terminal-window-title")!;
const terminalControls = [...document.querySelectorAll<HTMLButtonElement>("[data-terminal-action]")];
const portfolioWindow = document.querySelector<HTMLElement>("#portfolio-window")!;
const portfolioWindowTitle = document.querySelector<HTMLElement>("#portfolio-window-title")!;
const onlineStatus = document.querySelector<HTMLElement>("#online-status")!;
const windowControls = [...document.querySelectorAll<HTMLButtonElement>("[data-window-action]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const shellHistory = new ShellHistory();
const konamiDetector = new KonamiDetector();
let renderVersion = 0;
let konamiTimer = 0;
let activeGameCleanup: (() => void) | undefined;
document.querySelector<HTMLElement>("#year")!.textContent = String(new Date().getFullYear());

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function createGeographyGame() {
  const countryObject = (world as unknown as { objects: { countries: never } }).objects.countries;
  const collection = feature(world as never, countryObject) as unknown as FeatureCollection<Geometry, CountryProperties>;
  const countries: CountryFeature[] = collection.features.filter((item) => item.properties.name !== "Antarctica");
  const game = new GeographyGame(countries.map((item) => item.properties.name));
  const shell = element("section", "geography-game");
  shell.setAttribute("aria-label", "Interactive geography quiz");
  const hud = element("div", "geography-hud");
  const prompt = element("p");
  const score = element("strong");
  const feedback = element("p", "geography-feedback");
  feedback.setAttribute("aria-live", "polite");
  const restart = element("button");
  restart.type = "button";
  restart.textContent = "new round";
  restart.hidden = true;
  const mapControls = element("div", "map-controls");
  const zoomOut = element("button");
  zoomOut.type = "button";
  zoomOut.textContent = "−";
  zoomOut.setAttribute("aria-label", "Zoom map out");
  const zoomReset = element("button");
  zoomReset.type = "button";
  zoomReset.textContent = "reset";
  zoomReset.setAttribute("aria-label", "Reset map zoom");
  const zoomIn = element("button");
  zoomIn.type = "button";
  zoomIn.textContent = "+";
  zoomIn.setAttribute("aria-label", "Zoom map in");
  mapControls.append(zoomOut, zoomReset, zoomIn);
  hud.append(prompt, score, mapControls, feedback, restart);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 800 410");
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", "World map; choose a country");
  const mapLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.append(mapLayer);
  const path = geoPath(geoNaturalEarth1().fitSize([800, 410], collection));
  let playing = true;

  const updateHud = () => {
    prompt.textContent = `Find: ${game.target}`;
    score.textContent = `score: ${game.score}`;
  };

  countries.forEach((country) => {
    const name = country.properties.name;
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shape.setAttribute("d", path(country) ?? "");
    shape.setAttribute("tabindex", "0");
    shape.setAttribute("role", "button");
    shape.setAttribute("aria-label", name);
    const choose = () => {
      if (!playing) return;
      if (game.guess(name)) {
        feedback.textContent = `Correct—${name}! Next country loaded.`;
        shape.classList.add("is-correct");
        window.setTimeout(() => shape.classList.remove("is-correct"), 450);
        updateHud();
      } else {
        playing = false;
        feedback.textContent = `That’s ${name}. ${game.target} is highlighted. Final score: ${game.score}.`;
        shape.classList.add("is-wrong");
        [...mapLayer.querySelectorAll<SVGPathElement>("path")].find((item) => item.getAttribute("aria-label") === game.target)?.classList.add("is-answer");
        restart.hidden = false;
      }
    };
    shape.addEventListener("click", choose);
    shape.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose();
      }
    });
    mapLayer.append(shape);
  });

  const mapSelection = select<SVGSVGElement, unknown>(svg);
  const zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 8])
    .translateExtent([[-100, -80], [900, 490]])
    .on("zoom", (event) => mapLayer.setAttribute("transform", event.transform.toString()));
  mapSelection.call(zoomBehavior);
  zoomIn.addEventListener("click", () => zoomBehavior.scaleBy(mapSelection, 1.5));
  zoomOut.addEventListener("click", () => zoomBehavior.scaleBy(mapSelection, 1 / 1.5));
  zoomReset.addEventListener("click", () => zoomBehavior.transform(mapSelection, zoomIdentity));

  restart.addEventListener("click", () => {
    game.restart();
    playing = true;
    feedback.textContent = "New round started.";
    restart.hidden = true;
    mapLayer.querySelectorAll("path").forEach((shape) => shape.classList.remove("is-wrong", "is-answer", "is-correct"));
    updateHud();
  });
  updateHud();
  shell.append(hud, svg);
  return shell;
}

function createSnakeGame() {
  const game = new SnakeGame();
  const shell = element("section", "snake-game");
  shell.tabIndex = 0;
  shell.setAttribute("role", "application");
  shell.setAttribute("aria-label", "Snake game. Use arrow keys or W A S D to steer.");

  const hud = element("div", "snake-hud");
  const score = element("strong");
  const highScore = element("span");
  const status = element("span", "snake-status");
  status.setAttribute("aria-live", "polite");
  const difficulty = element("label");
  difficulty.textContent = "speed ";
  const speed = element("select");
  speed.setAttribute("aria-label", "Snake speed");
  [["easy", "160"], ["medium", "105"], ["hard", "65"]].forEach(([label, value]) => {
    const option = element("option");
    option.value = value;
    option.textContent = label;
    speed.append(option);
  });
  difficulty.append(speed);
  const action = element("button");
  action.type = "button";
  action.textContent = "start";
  const restart = element("button");
  restart.type = "button";
  restart.textContent = "restart";
  hud.append(score, highScore, status, difficulty, action, restart);

  const canvas = element("canvas");
  canvas.width = 720;
  canvas.height = 480;
  canvas.setAttribute("aria-label", "Snake game board");
  const context = canvas.getContext("2d")!;
  let timer = 0;
  let best = 0;
  try { best = Number(window.localStorage.getItem("katycodes-snake-best")) || 0; } catch { /* optional storage */ }

  const draw = () => {
    const cellWidth = canvas.width / game.width;
    const cellHeight = canvas.height / game.height;
    const styles = getComputedStyle(document.body);
    context.fillStyle = "#0b1027";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(201, 246, 90, .08)";
    context.lineWidth = 1;
    for (let x = 1; x < game.width; x += 1) {
      context.beginPath(); context.moveTo(x * cellWidth, 0); context.lineTo(x * cellWidth, canvas.height); context.stroke();
    }
    for (let y = 1; y < game.height; y += 1) {
      context.beginPath(); context.moveTo(0, y * cellHeight); context.lineTo(canvas.width, y * cellHeight); context.stroke();
    }
    game.snake.forEach((cell, index) => {
      context.fillStyle = index === 0 ? styles.getPropertyValue("--lime") || "#c9f65a" : "#7fbf4d";
      context.fillRect(cell.x * cellWidth + 2, cell.y * cellHeight + 2, cellWidth - 4, cellHeight - 4);
    });
    context.fillStyle = styles.getPropertyValue("--coral") || "#ff7657";
    context.fillRect(game.food.x * cellWidth + 3, game.food.y * cellHeight + 3, cellWidth - 6, cellHeight - 6);
    score.textContent = `score: ${game.score}`;
    highScore.textContent = `best: ${best}`;
  };

  const stopTimer = () => { window.clearInterval(timer); timer = 0; };
  activeGameCleanup = stopTimer;
  const updateStatus = () => {
    status.textContent = game.status;
    action.textContent = game.status === "playing" ? "pause" : game.status === "paused" ? "resume" : game.status === "over" ? "play again" : "start";
    speed.disabled = game.status === "playing";
  };
  const startTimer = () => {
    stopTimer();
    timer = window.setInterval(() => {
      game.tick();
      if (game.score > best) {
        best = game.score;
        try { window.localStorage.setItem("katycodes-snake-best", String(best)); } catch { /* optional storage */ }
      }
      if (game.status === "over") stopTimer();
      updateStatus();
      draw();
    }, Number(speed.value));
  };
  const start = () => {
    if (game.status === "over") game.restart();
    if (game.status === "playing") {
      game.pause();
      stopTimer();
    } else {
      game.start();
      startTimer();
    }
    updateStatus();
    draw();
    shell.focus();
  };
  const steer = (direction: Direction) => {
    game.turn(direction);
    if (game.status === "ready") start();
  };

  const controls = element("div", "snake-controls");
  (["up", "left", "down", "right"] as Direction[]).forEach((direction) => {
    const button = element("button");
    button.type = "button";
    button.dataset.direction = direction;
    button.setAttribute("aria-label", `Move ${direction}`);
    button.textContent = ({ up: "↑", down: "↓", left: "←", right: "→" })[direction];
    button.addEventListener("click", () => steer(direction));
    controls.append(button);
  });
  const keyDirections: Record<string, Direction> = {
    ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
  };
  shell.addEventListener("keydown", (event) => {
    const direction = keyDirections[event.key];
    if (direction) { event.preventDefault(); event.stopPropagation(); steer(direction); }
    if (event.key === " " && !direction) { event.preventDefault(); event.stopPropagation(); start(); }
  });
  action.addEventListener("click", start);
  restart.addEventListener("click", () => {
    stopTimer(); game.restart(); updateStatus(); draw(); shell.focus();
  });
  updateStatus();
  draw();
  shell.append(hud, canvas, controls);
  return shell;
}

function pause(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function applyTheme(theme: "light" | "midnight") {
  document.body.dataset.theme = theme;
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", theme === "midnight" ? "#080d1b" : "#dce5f6");
  try {
    window.localStorage.setItem("katycodes-theme", theme);
  } catch {
    // The theme still works when storage is unavailable.
  }
}

function revealKonami() {
  window.clearTimeout(konamiTimer);
  konamiToast.hidden = false;
  requestAnimationFrame(() => konamiToast.classList.add("is-visible"));
  announcer.textContent = "Achievement unlocked. Katy mode on.";
  input.disabled = false;
  input.readOnly = false;
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(0, 0);
  });
  konamiTimer = window.setTimeout(() => {
    konamiToast.classList.remove("is-visible");
    window.setTimeout(() => { konamiToast.hidden = true; }, reducedMotion.matches ? 0 : 180);
  }, 3200);
}

function setTerminalWindow(action: "pause" | "minimize" | "expand") {
  const className = `is-${action === "pause" ? "paused" : action === "minimize" ? "minimized" : "expanded"}`;
  const willActivate = !terminalConsole.classList.contains(className);
  terminalConsole.classList.remove("is-paused", "is-minimized", "is-expanded");
  if (willActivate) terminalConsole.classList.add(className);
  document.body.classList.toggle("terminal-expanded", terminalConsole.classList.contains("is-expanded"));

  terminalControls.forEach((control) => {
    const activeClass = `is-${control.dataset.terminalAction === "pause" ? "paused" : control.dataset.terminalAction === "minimize" ? "minimized" : "expanded"}`;
    control.setAttribute("aria-pressed", String(terminalConsole.classList.contains(activeClass)));
  });

  terminalWindowTitle.textContent = terminalConsole.classList.contains("is-paused")
    ? "session paused — click red to restore"
    : terminalConsole.classList.contains("is-minimized")
      ? "katycodes — minimized"
      : terminalConsole.classList.contains("is-expanded")
        ? "katycodes — expanded"
        : "katycodes — bash";
  announcer.textContent = terminalWindowTitle.textContent;

  if (!terminalConsole.classList.contains("is-paused") && !terminalConsole.classList.contains("is-minimized")) {
    requestAnimationFrame(() => input.focus());
  }
}

function setPortfolioWindow(action: "pause" | "minimize" | "expand") {
  const className = `window-${action === "pause" ? "paused" : action === "minimize" ? "minimized" : "expanded"}`;
  const willActivate = !portfolioWindow.classList.contains(className);
  portfolioWindow.classList.remove("window-paused", "window-minimized", "window-expanded");
  if (willActivate) portfolioWindow.classList.add(className);
  document.body.classList.toggle("portfolio-expanded", portfolioWindow.classList.contains("window-expanded"));

  windowControls.forEach((control) => {
    const activeClass = `window-${control.dataset.windowAction === "pause" ? "paused" : control.dataset.windowAction === "minimize" ? "minimized" : "expanded"}`;
    control.setAttribute("aria-pressed", String(portfolioWindow.classList.contains(activeClass)));
  });

  portfolioWindowTitle.textContent = portfolioWindow.classList.contains("window-paused")
    ? "katy@codes — session paused (click red to restore)"
    : portfolioWindow.classList.contains("window-minimized")
      ? "katy@codes — minimized"
      : portfolioWindow.classList.contains("window-expanded")
        ? "katy@codes — ~/portfolio — expanded"
        : "katy@codes — ~/portfolio";
  onlineStatus.textContent = portfolioWindow.classList.contains("window-paused") ? "paused" : "online";
  announcer.textContent = portfolioWindowTitle.textContent;

  if (!portfolioWindow.classList.contains("window-paused") && !portfolioWindow.classList.contains("window-minimized")) {
    requestAnimationFrame(() => input.focus());
  }
}

async function typeText(node: HTMLElement, value: string, version: number) {
  if (reducedMotion.matches) {
    node.textContent = value;
    return true;
  }

  node.textContent = "";
  for (let index = 0; index < value.length; index += 3) {
    if (version !== renderVersion) return false;
    node.textContent = value.slice(0, index + 3);
    await pause(9);
  }
  node.textContent = value;
  return version === renderVersion;
}

async function render(result: CommandResult) {
  const version = ++renderVersion;
  if (result.kind === "clear") {
    history.replaceChildren();
    announcer.textContent = "Terminal cleared.";
    return;
  }

  const article = element("article", "output");
  const prompt = element("p", "prompt");
  const user = element("span");
  user.textContent = "katy@codes";
  prompt.append(user, document.createTextNode(`:~$ ${result.command}`));
  article.append(prompt);
  history.append(article);

  if (result.title) {
    const title = element("h2");
    article.append(title);
    if (!(await typeText(title, result.title, version))) return;
  }

  for (const line of result.lines) {
    const paragraph = element("p");
    article.append(paragraph);
    if (!(await typeText(paragraph, line, version))) return;
  }

  if (result.game === "geography") article.append(createGeographyGame());
  if (result.game === "snake") article.append(createSnakeGame());

  if (result.projects) {
    const label = element("h3", "collection-label");
    label.textContent = "Selected web work";
    const grid = element("div", "project-grid");
    result.projects.forEach((project) => {
      const card = element("article", "project-card");
      const image = element("img");
      image.src = project.image;
      image.alt = "";
      image.loading = "lazy";
      const copy = element("div", "project-copy");
      const title = element("h4");
      title.textContent = project.title;
      const note = element("p");
      note.textContent = project.note;
      const role = element("p", "project-role");
      role.textContent = project.role;
      const stack = element("ul", "project-stack");
      project.stack.forEach((technology) => {
        const item = element("li");
        item.textContent = technology;
        stack.append(item);
      });
      const outcome = element("p", "project-outcome");
      outcome.textContent = project.outcome;
      copy.append(title, note, role, stack, outcome);
      if (project.href) {
        const link = element("a");
        link.href = project.href;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "view code ↗";
        copy.append(link);
      }
      card.append(image, copy);
      grid.append(card);
    });
    article.append(label, grid);
  }

  if (result.repositories) {
    const label = element("h3", "collection-label");
    label.textContent = "From GitHub";
    const list = element("div", "repo-grid");
    result.repositories.forEach((repository) => {
      const link = element("a", "repo-card");
      link.href = repository.href;
      link.target = "_blank";
      link.rel = "noreferrer";
      const meta = element("span");
      meta.textContent = `● ${repository.language}`;
      const title = element("h4");
      title.textContent = repository.title;
      const description = element("p");
      description.textContent = repository.description;
      link.append(meta, title, description);
      list.append(link);
    });
    article.append(label, list);
  }

  if (result.resume) {
    const resume = element("div", "terminal-resume");
    resume.tabIndex = 0;
    resume.setAttribute("role", "region");
    resume.setAttribute("aria-label", "Full résumé; scrollable");
    result.resume.forEach((resumeSection) => {
      const section = element("section", "resume-section");
      const heading = element("h3");
      heading.textContent = resumeSection.heading;
      section.append(heading);
      resumeSection.entries.forEach((resumeEntry) => {
        const entry = element("div", "resume-entry");
        if (resumeEntry.title || resumeEntry.meta) {
          const header = element("div", "resume-entry-header");
          if (resumeEntry.title) {
            const title = element("h4");
            title.textContent = resumeEntry.title;
            header.append(title);
          }
          if (resumeEntry.meta) {
            const meta = element("span");
            meta.textContent = resumeEntry.meta;
            header.append(meta);
          }
          entry.append(header);
        }
        resumeEntry.details.forEach((detail) => {
          const paragraph = element("p");
          paragraph.textContent = detail;
          entry.append(paragraph);
        });
        section.append(entry);
      });
      resume.append(section);
    });
    article.append(resume);
  }

  if (result.links) {
    const links = element("div", "output-links");
    result.links.forEach((link) => {
      if (link.href.startsWith("#")) {
        const button = element("button");
        button.type = "button";
        button.textContent = link.label;
        button.addEventListener("click", () => execute(link.label, true));
        links.append(button);
      } else {
        const anchor = element("a");
        anchor.href = link.href;
        if (link.href.endsWith(".docx") || link.href.endsWith(".pdf")) {
          anchor.download = link.href.endsWith(".pdf") ? "Katy_Henning_Resume.pdf" : "Katy_Henning_Resume.docx";
        }
        anchor.textContent = `${link.label} ↗`;
        links.append(anchor);
      }
    });
    article.append(links);
  }

  announcer.textContent = result.resume
    ? `${result.title}. Full résumé loaded in a scrollable region.`
    : [result.title, ...result.lines].filter(Boolean).join(" ");
}

async function execute(value: string, replace = false, remember = true) {
  const command = value.trim();
  if (!command) return;
  activeGameCleanup?.();
  activeGameCleanup = undefined;
  if (remember) shellHistory.push(command);
  if (replace) history.replaceChildren();
  input.value = "";
  input.focus();
  const result: CommandResult = command.toLowerCase() === "history"
    ? {
        kind: "content",
        command,
        title: "Command history",
        lines: shellHistory.list().map((entry, index) => `${String(index + 1).padStart(3, " ")}  ${entry}`),
      }
    : runCommand(command);
  if (result.kind === "content" && result.theme) applyTheme(result.theme);
  await render(result);
}

PRIMARY_COMMANDS.forEach((command, index) => {
  const button = element("button");
  button.type = "button";
  button.setAttribute("aria-label", `Run ${command} command`);
  const number = element("span");
  number.textContent = `0${index + 1}`;
  button.append(number, document.createTextNode(command));
  button.addEventListener("click", () => execute(command, true));
  menu.append(button);
});

clickTrigger.addEventListener("click", () => execute("click", true));

terminalControls.forEach((control) => {
  control.addEventListener("click", () => setTerminalWindow(control.dataset.terminalAction as "pause" | "minimize" | "expand"));
});

windowControls.forEach((control) => {
  control.addEventListener("click", () => setPortfolioWindow(control.dataset.windowAction as "pause" | "minimize" | "expand"));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (input.value.trim()) execute(input.value, true);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    input.value = shellHistory.previous(input.value);
    input.setSelectionRange(input.value.length, input.value.length);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    input.value = shellHistory.next();
    input.setSelectionRange(input.value.length, input.value.length);
  } else if (event.key === "Tab") {
    event.preventDefault();
    const completion = completeInput(input.value, COMPLETIONS);
    input.value = completion.value;
    if (completion.matches.length > 1 && completion.value === input.value) {
      void render({ kind: "content", command: input.value || "Tab", lines: [completion.matches.join("    ")] });
    }
  } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    void execute("clear", true, false);
  } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
    event.preventDefault();
    renderVersion += 1;
    input.value = "";
    history.replaceChildren();
    void render({ kind: "content", command: "^C", lines: ["Process interrupted."] });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (konamiDetector.push(event.key)) {
    event.preventDefault();
    event.stopPropagation();
    input.value = "";
    revealKonami();
  }
}, { capture: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && terminalConsole.classList.contains("is-expanded")) {
    setTerminalWindow("expand");
  } else if (event.key === "Escape" && portfolioWindow.classList.contains("window-expanded")) {
    setPortfolioWindow("expand");
  }
});

terminalBody.addEventListener("click", (event) => {
  if (event.target === terminalBody) input.focus();
});

try {
  if (window.localStorage.getItem("katycodes-theme") === "midnight") applyTheme("midnight");
} catch {
  // Use the default theme when storage is unavailable.
}

void render(runCommand("about"));
