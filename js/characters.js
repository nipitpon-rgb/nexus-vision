const CHARACTERS = [
  {id:"CHR-001",name:"NOVA",accent:"#22d3ee",initial:"N",status:"ACTIVE"},
  {id:"CHR-002",name:"VANTA",accent:"#8b5cf6",initial:"V",status:"STANDBY"},
  {id:"CHR-003",name:"AETHER",accent:"#60a5fa",initial:"A",status:"STANDBY"},
  {id:"CHR-004",name:"LYRA",accent:"#f472b6",initial:"L",status:"STANDBY"},
  {id:"CHR-005",name:"ONYX",accent:"#a3a3a3",initial:"O",status:"STANDBY"}
];

export class CharacterSystem {
  constructor(ui) {
    this.ui = ui;
    this.characters = CHARACTERS;
    this.selected = CHARACTERS[0];
  }

  init() {
    this.ui.renderCharacters(this.characters, this.selected.id);
    this.select(this.selected.id);
  }

  select(id) {
    const next = this.characters.find(c => c.id === id);
    if (!next) return;
    this.selected = next;
    document.documentElement.style.setProperty("--accent", next.accent);
    this.ui.renderCharacters(this.characters, id);
    this.ui.setCharacter(next);
  }

  react(gesture) {
    const reactions = {
      "OPEN PALM":"HAND RAISE",
      "POINT":"TARGET LOCK",
      "FIST":"POWER STATE",
      "THUMB UP":"POSITIVE",
      "THUMB DOWN":"NEGATIVE",
      "VICTORY":"SPECIAL REACTION",
      "OK":"CONFIRMED",
      "TRACKING":"TRACKING",
      "NONE":"READY"
    };
    this.ui.setReaction(reactions[gesture] || "TRACKING");
  }
}
