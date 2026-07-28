export const KONAMI_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"] as const;

export class KonamiDetector {
  private index = 0;

  push(key: string) {
    if (key === KONAMI_SEQUENCE[this.index]) {
      this.index += 1;
    } else {
      this.index = key === KONAMI_SEQUENCE[0] ? 1 : 0;
    }

    if (this.index === KONAMI_SEQUENCE.length) {
      this.index = 0;
      return true;
    }
    return false;
  }
}

export class ShellHistory {
  private entries: string[] = [];
  private index = 0;
  private draft = "";

  push(command: string) {
    if (!command.trim()) return;
    this.entries.push(command);
    this.index = this.entries.length;
    this.draft = "";
  }

  previous(currentValue: string) {
    if (!this.entries.length) return currentValue;
    if (this.index === this.entries.length) this.draft = currentValue;
    this.index = Math.max(0, this.index - 1);
    return this.entries[this.index];
  }

  next() {
    if (!this.entries.length) return this.draft;
    this.index = Math.min(this.entries.length, this.index + 1);
    return this.index === this.entries.length ? this.draft : this.entries[this.index];
  }

  list() {
    return [...this.entries];
  }
}

export function completeInput(rawValue: string, candidates: readonly string[]) {
  const value = rawValue.toLowerCase();
  const matches = candidates.filter((candidate) => candidate.startsWith(value));
  if (!matches.length) return { value: rawValue, matches };
  if (matches.length === 1) return { value: matches[0], matches };

  let common = matches[0];
  for (const match of matches.slice(1)) {
    while (common && !match.startsWith(common)) common = common.slice(0, -1);
  }
  return { value: common.length > value.length ? common : rawValue, matches };
}
