export class GeographyGame {
  score = 0;
  target = "";
  private readonly countries: string[];
  private readonly random: () => number;

  constructor(countries: string[], random = Math.random) {
    this.countries = countries;
    this.random = random;
    this.next();
  }

  next() {
    const choices = this.countries.filter((country) => country !== this.target);
    this.target = choices[Math.floor(this.random() * choices.length)];
    return this.target;
  }

  guess(country: string) {
    const correct = country === this.target;
    if (correct) {
      this.score += 1;
      this.next();
    }
    return correct;
  }

  restart() {
    this.score = 0;
    return this.next();
  }
}
