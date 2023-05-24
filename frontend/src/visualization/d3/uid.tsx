/** @format */

var count = 0;

export default function uid(name: string | null) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

class Id {
  id: string;
  href: string;
  constructor(id: string) {
    this.id = id;
    this.href = `#${id}`;
  }
  toString() {
    return "url(" + this.href + ")";
  }
}