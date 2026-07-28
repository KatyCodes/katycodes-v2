export const COMMANDS = ["about", "projects", "games", "resume", "contact", "geography", "snake", "help", "clear", "history", "pwd", "theme", "man katy", "uname -a", "git log --oneline", "sudo hire katy", "coffee", "click"] as const;
export const PRIMARY_COMMANDS = ["about", "projects", "games", "resume", "contact", "help"] as const;
export const COMPLETIONS = [
  ...COMMANDS,
  "whoami",
  "open projects",
  "cat resume",
  "email",
  "ls",
  "cls",
  "theme light",
  "theme midnight",
] as const;

export type CommandName = (typeof COMMANDS)[number];

export type CommandResult =
  | { kind: "content"; command: string; title?: string; lines: string[]; links?: { label: string; href: string }[]; projects?: ProjectItem[]; repositories?: RepositoryItem[]; resume?: ResumeSection[]; theme?: "light" | "midnight"; game?: "geography" | "snake" }
  | { kind: "clear"; command: "clear" };

export type ProjectItem = { title: string; image: string; note: string; role: string; stack: string[]; outcome: string; href?: string };
export type RepositoryItem = { title: string; description: string; language: string; href: string };
export type ResumeEntry = { title?: string; meta?: string; details: string[] };
export type ResumeSection = { heading: string; entries: ResumeEntry[] };

const fullResume: ResumeSection[] = [
  {
    heading: "Professional summary",
    entries: [{ details: ["Full-stack software engineer with 8+ years of experience building and supporting web applications across C#, .NET, JavaScript, PHP, React, and WordPress environments. Skilled in AI-assisted development, production delivery, cloud and DNS operations, cross-functional collaboration, and practical troubleshooting within Agile teams."] }],
  },
  {
    heading: "Technical skills",
    entries: [{ details: [
      "Languages: C#, JavaScript, TypeScript, PHP, Java, SQL",
      "Frameworks & platforms: .NET Core, ASP.NET, React, Node.js, WordPress, CodeIgniter, Joomla, Shopify",
      "APIs & data: REST APIs, third-party integrations, JSON, authentication, MySQL, PostgreSQL",
      "Cloud & delivery: Azure DevOps, AWS, Cloudflare, Docker, GitHub Actions, CI/CD pipelines, Git, Jira, Trello",
      "Engineering practices: TDD, SOLID principles, clean code, refactoring, Agile, Scrum, debugging, troubleshooting",
    ] }],
  },
  {
    heading: "AI-assisted development",
    entries: [{ details: [
      "Tools: Claude, OpenAI Codex, GitHub Copilot, ChatGPT, Google Gemini, and Cursor",
      "Applied experience: Code generation, refactoring, debugging, test development, documentation, technical research, prompt design, context management, human-in-the-loop review, and agent-assisted workflows.",
    ] }],
  },
  {
    heading: "Professional experience",
    entries: [
      {
        title: "Software Engineer | CD Baby",
        meta: "Oct 2020 – Present",
        details: [
          "Integrated multiple AI services, including Hive AI, to review album artwork for inappropriate or inaccurate content, reducing rejection rates from digital service providers by approximately 30%.",
          "Integrated the Music Fights Fraud Alliance (MFFA) service to identify bad actors attempting to submit music they did not own, strengthening content authenticity protections.",
          "Build and enhance production applications and REST API integrations using C#, .NET, JavaScript, TypeScript, React, PHP, JSON, and authentication workflows.",
          "Deliver applications through Azure DevOps and GitHub Actions CI/CD workflows, use Docker, and manage production DNS configurations through Cloudflare.",
        ],
      },
      {
        title: "WordPress Developer | DreamHost",
        meta: "Aug 2017 – Oct 2020",
        details: [
          "Diagnosed, maintained, and updated custom websites built with PHP, WordPress, CodeIgniter, Concrete5, and Joomla.",
          "Provided customer-facing and internal technical support for WordPress and PHP updates, compatibility issues, and site troubleshooting.",
        ],
      },
      {
        title: "Web Developer | Side Dish Studios",
        meta: "Jan 2017 – Mar 2017",
        details: [
          "Built a custom content management system for a social networking site using CodeIgniter.",
          "Improved mobile usability with responsive JavaScript, jQuery, and Skeleton development; refreshed a Shopify interface and implemented a custom PHP contact form.",
        ],
      },
    ],
  },
  {
    heading: "Education",
    entries: [
      { title: "Computer Programming | Epicodus", meta: "2016 – 2017", details: [] },
      { title: "Bachelor of Arts | University of Oregon", meta: "2004 – 2008", details: [] },
    ],
  },
];

const legacyProjects: ProjectItem[] = [
  { title: "Float:West", image: "/projects/float-west.webp", note: "Selected web work", role: "Front-end implementation", stack: ["Responsive UI", "JavaScript"], outcome: "A preserved snapshot of client-facing work; expanded case study in progress." },
  { title: "Fancy Plants", image: "/projects/fancy-plants.webp", note: "Selected web work", role: "Front-end implementation", stack: ["Responsive UI", "Web"], outcome: "Visual design translated into a polished, responsive browsing experience." },
  { title: "Paintscaping", image: "/projects/paintscaping.webp", note: "Selected web work", role: "Web development", stack: ["Responsive UI", "CMS"], outcome: "A content-forward presentation designed to let the project imagery lead." },
  { title: "Piggeeback", image: "/projects/piggeeback.webp", note: "Selected web work", role: "Web development", stack: ["Responsive UI", "JavaScript"], outcome: "An approachable product experience preserved from the original portfolio." },
  { title: "Kachka", image: "/projects/kachka.webp", note: "Code available", role: "PHP development", stack: ["PHP", "Web application"], outcome: "A production-shaped PHP project with the original source retained on GitHub.", href: "https://github.com/KatyCodes/kk" },
  { title: "Tappan Collective", image: "/projects/tappan-collective.webp", note: "Selected web work", role: "Front-end implementation", stack: ["Responsive UI", "E-commerce"], outcome: "A visual, artwork-first commerce experience from the portfolio archive." },
];

const featuredRepositories: RepositoryItem[] = [
  { title: "Amazing College", description: "A fictional college website built as a PHP application.", language: "PHP", href: "https://github.com/KatyCodes/amazing-college" },
  { title: "JS Geography", description: "A Google Maps geography quiz built collaboratively with JavaScript, Node, Gulp, Sass, and Bootstrap.", language: "JavaScript", href: "https://github.com/KatyCodes/js-geography" },
  { title: "Angular Meal Tracker", description: "A TypeScript and Angular meal log with calorie entry and high/low filtering.", language: "TypeScript / Angular", href: "https://github.com/KatyCodes/AngularMealTracker" },
];

const aliases: Record<string, CommandName> = {
  whoami: "about",
  "open projects": "projects",
  "cat resume": "resume",
  email: "contact",
  ls: "help",
  cls: "clear",
};

const content: Record<Exclude<CommandName, "clear">, Omit<Extract<CommandResult, { kind: "content" }>, "kind" | "command">> = {
  help: {
    title: "Available commands",
    lines: [
      "about · projects · games · resume · contact · geography · snake · help · clear · history · pwd · theme",
      "Shell extras: man katy · uname -a · git log --oneline",
      "Aliases: whoami · open projects · cat resume · email · ls · cls",
      "Keyboard: ↑/↓ history · Tab complete · Ctrl+L clear · Ctrl+C cancel",
    ],
    links: PRIMARY_COMMANDS.map((command) => ({ label: command, href: `#${command}` })),
  },
  about: {
    title: "Hello, I’m Katy.",
    lines: [
      "I’m a full-stack software engineer with 8+ years of experience building and supporting web applications.",
      "I like thoughtful software, useful details, practical problem-solving, and a little personality.",
    ],
  },
  projects: {
    title: "Things I’ve made",
    lines: [
      "A mix of client-facing web work and code from my GitHub archive.",
      "The screenshots made the trip. Better project stories are next.",
    ],
    projects: legacyProjects,
    repositories: featuredRepositories,
    links: [{ label: "all GitHub repositories", href: "https://github.com/KatyCodes?tab=repositories" }],
  },
  games: {
    title: "Katy’s Arcade",
    lines: [
      "Small games, real engineering details. Choose one to play inside the terminal.",
      "Snake is a TypeScript modernization of my original C# game. Geography is a keyless rebuild of a collaborative JavaScript project.",
    ],
    links: [
      { label: "snake", href: "#snake" },
      { label: "geography", href: "#geography" },
    ],
  },
  resume: {
    title: "Katy Henning — Software Engineer",
    lines: ["Portland, OR · 503-369-7542 · katyannhenning@gmail.com"],
    resume: fullResume,
    links: [
      { label: "download PDF résumé", href: "/Katy_Henning_Resume.pdf" },
      { label: "download Word résumé", href: "/Katy_Henning_Resume.docx" },
    ],
  },
  contact: {
    title: "Let’s make something good.",
    lines: ["The quickest way to reach me is by email."],
    links: [{ label: "katyannhenning@gmail.com", href: "mailto:katyannhenning@gmail.com" }],
  },
  geography: {
    title: "Geography Quiz",
    lines: ["Click—or keyboard-select—the requested country. One miss ends the round."],
    game: "geography",
  },
  snake: {
    title: "Snake",
    lines: ["Eat the pixels. Avoid the walls and yourself. Use arrows, WASD, or the controls below."],
    game: "snake",
  },
  "sudo hire katy": {
    title: "Permission granted. ✓",
    lines: ["Excellent choice. Katy has been added to your team.", "Next step: run `email` before someone else does."],
    links: [{ label: "start the conversation", href: "mailto:katyannhenning@gmail.com?subject=Let’s%20make%20something%20click" }],
  },
  coffee: {
    title: "Brewing… ☕",
    lines: ["Coffee compiled successfully. Motivation is now running in production."],
  },
  click: {
    title: "You clicked the click. ✓",
    lines: ["Excellent. Everything is working exactly as advertised."],
  },
  history: {
    title: "Command history",
    lines: ["Your current session history appears here."],
  },
  pwd: {
    lines: ["/home/katy/portfolio"],
  },
  theme: {
    title: "Theme settings",
    lines: ["Usage: theme light | theme midnight"],
  },
  "man katy": {
    title: "KATY(1) — General Commands Manual",
    lines: [
      "NAME        katy — full-stack software engineer and practical problem solver",
      "SYNOPSIS    katy [--build] [--debug] [--collaborate] [--add-personality]",
      "DESCRIPTION Builds and supports thoughtful web applications, APIs, integrations, and production systems.",
      "SEE ALSO    projects(1), resume(1), contact(1), coffee(6)",
    ],
  },
  "uname -a": {
    lines: ["KatyCodes 2.0.0 portfolio-web DreamHost/static TypeScript JavaScript WCAG-AA"],
  },
  "git log --oneline": {
    title: "main",
    lines: [
      "2f9a7d1 (HEAD -> main) ship KatyCodes portfolio v2.0",
      "8ac0e44 build an accessible interactive terminal",
      "2020cdb join CD Baby and keep shipping",
      "2017dhi turn WordPress troubleshooting into a career",
      "2016epi learn by building at Epicodus",
    ],
  },
};

export function runCommand(rawCommand: string): CommandResult {
  const enteredCommand = rawCommand.trim().toLowerCase();
  const command = aliases[enteredCommand] ?? enteredCommand;

  if (command === "clear") return { kind: "clear", command };

  if (enteredCommand === "theme light" || enteredCommand === "theme midnight") {
    const theme = enteredCommand.endsWith("midnight") ? "midnight" : "light";
    return {
      kind: "content",
      command: enteredCommand,
      title: `Theme set to ${theme}.`,
      lines: [theme === "midnight" ? "Low light. High contrast. Same Katy." : "Back to the original daylight palette."],
      theme,
    };
  }

  if (command in content) {
    return { kind: "content", command: enteredCommand, ...content[command as keyof typeof content] };
  }

  return {
    kind: "content",
    command: enteredCommand,
    title: `command not found: ${enteredCommand || "…"}`,
    lines: ["Type “help” to see what works here."],
  };
}
