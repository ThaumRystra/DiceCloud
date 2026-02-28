# The Expanse RPG — DiceCloud Playtest Guide

This is the single-page reference for running The Expanse RPG (Adventure Game Engine) using DiceCloud. It covers both character play (VH-003) and ship combat (VH-003b).

---

## Character Creation Summary

### 9 Abilities (AGE System)

| Ability | Variable | Description |
|---------|----------|-------------|
| Accuracy | `accuracy` | Ranged attacks, precise shots |
| Communication | `communication` | Persuasion, leadership, performance |
| Constitution | `constitution` | Health, endurance, resistance |
| Dexterity | `dexterity` | Speed, stealth, acrobatics |
| Fighting | `fighting` | Melee attacks and brawling |
| Intelligence | `intelligence` | Knowledge, tech, problem-solving |
| Perception | `perception` | Awareness, detecting threats |
| Strength | `strength` | Physical power, lifting, climbing |
| Willpower | `willpower` | Mental fortitude, courage, discipline |

**Starting range:** −2 to 4. Typical starting characters: spread across 0–3 with one ability at 3 (primary) and a handful at 1–2.

### Derived Stats (auto-computed)

| Stat | Formula | Notes |
|------|---------|-------|
| Toughness | `10 + Constitution` | Threshold for incoming damage to cause conditions |
| Defense | `10 + Dexterity` | TN attackers must beat to hit you |
| Speed | `10 + Dexterity + Perception` | Yards per move action |
| Fortune | `10 + Level × 2 + Constitution` | Tracks as health bar AND spendable resource pool |

### Focuses

Each Focus grants +2 to rolls with its linked Ability. Focuses appear as skills on the character sheet. At level 1, characters typically start with 2–3 Focuses.

**Sample focuses in the library:** Stealth (Dex), Technology (Int), Bargaining (Com), Piloting (Dex), Free-fall (Dex), Gambling (Com).

---

## Core Roll Mechanic

**Standard test:** Roll **3d6 + Ability** vs **Target Number (TN)**.
- Default TN for ordinary tasks: **11**
- Difficult tasks: **13–15**
- Extremely difficult: **17+**

**With a Focus:** Add **+2** to the roll if the Focus applies.

**Success/failure:** Meet or exceed the TN to succeed. Exceeding by 5+ = impressive success.

---

## Stunt Points and the Drama Die

One of the three d6 is designated the **Drama Die** (typically a different color).

**Generating Stunt Points:** If **any two d6 show the same number** (doubles), you generate SP equal to the Drama Die's value (even if you fail the test overall).

**Spending SP:** Immediately spend SP for special effects from the Stunts list:
- 1 SP: Deal +1 damage, move 2 yards extra, create a minor advantage
- 2 SP: Stay on guard, knock prone, knock back
- 3 SP: Disarm, lethal blow (injury on top of damage), precise strike
- 4 SP: Lightning attack (make a second attack), seize the initiative

SP cannot be saved — spend them immediately or lose them.

---

## Fortune (Health and Resource)

Fortune serves a dual purpose:

1. **Health bar:** All damage reduces Fortune directly. When Fortune reaches 0, the character is **Taken Out** (GM decides outcome — unconscious, captured, dying).

2. **Spendable resource:** Before OR after rolling, spend up to **6 Fortune Points** to add that many to ONE die result (not the sum, one die). Decide how many to spend, reduce Fortune, then modify the die. Can turn a failure into a success.

Fortune does not reset between scenes unless the GM rules otherwise. Rest and medical care can restore it.

---

## Conditions Table

| Condition | Effect | Typical Cause |
|-----------|--------|---------------|
| **Hindered** | Speed × 0.5 | Difficult terrain, environmental hazard |
| **Restrained** | Speed × 0.5 | Grabbed, grappled, pinned |
| **Injured** | −1 to all 9 Abilities | Hit exceeds Toughness by 1–3 |
| **Wounded** | −2 to all 9 Abilities + Speed × 0.5 | Hit exceeds Toughness by 4+ |
| **Dying** | Lose 1 CON/round until stabilized | Fortune at 0 in lethal situation |

Stabilizing a Dying character requires a TN 13 Constitution test (can be assisted).

---

## Ship Combat Setup (Multi-Tab Workflow)

Ship combat involves the whole crew contributing to one ship's stats. Use DiceCloud's multi-tab browser workflow:

1. Open the **ship sheet** (Rocinante or your ship) in one browser tab
2. Open each **crew character sheet** in separate browser tabs
3. **Before combat begins:** Set the crew station stats on the ship sheet:
   - `Gunner — Accuracy` → Gunner's Accuracy score
   - `Pilot — Dexterity` → Pilot's Dexterity score
   - `Engineer — Intelligence` → Engineer's Intelligence score
   - `Commander — Communication` → Commander's Communication score
4. All combat rolls happen **from the ship sheet** using these pre-set values

---

## Ship Combat Round Structure (7 Phases)

### Phase 1: Command
**Who acts:** Commander (Communication — Leadership)
**Roll:** `3d6 + Communication` vs TN 11
**Effect:** On success, generate SP equal to the Drama Die value. These are **Command SP** — any crew member can spend them on any action this round. Set `commandSP` on the sheet and reset to 0 next round.

### Phase 2: Maneuvers
**Who acts:** Pilot (Dexterity — Piloting)
**Roll:** `3d6 + Dexterity + Maneuverability` vs TN 11
**Effect:** Success shifts range band ±1 (your choice of direction). Update the `rangeBand` stat.
**Optional:** Declare a **High-G burn** before rolling. If you do: add +2 to your evasion TN this round (harder to hit), but all crew must make CON TN 13 or take 1d6 damage from the acceleration.

### Phase 3: Electronic Warfare
**Who acts:** EW Officer (Intelligence — Technology)
**Roll:** `3d6 + Intelligence` vs TN 11
**Effect:** Success generates EW Points equal to the Drama Die. Spend immediately for effects (blind targeting, disrupt communications, force range band change, etc. — use SP-style list from corebook).

### Phase 4: Weapon Attacks
**Who acts:** Gunner (Accuracy — Gunnery)
**Roll:** `3d6 + Accuracy` vs TN 11 + target's Sensors
**Available by range band:**
- **Long (0):** Torpedoes only. Can be intercepted by enemy PDCs.
- **Medium (1):** Rail guns (4d6 damage). Torpedoes.
- **Close (2):** All weapons including PDCs (2d6 damage).

**Damage:** Roll weapon damage, subtract target's Hull Rating. Minimum 0.

### Phase 5: Defensive Actions
**Who acts:** Pilot (Dexterity — Piloting) AND/OR Gunner (point defense)

**Evasion:** Set `evasionTN` = 10 + attacking ship's Sensors. Roll `3d6 + Dexterity` vs evasionTN. On success: attacker's shots miss for this phase.

**Point Defense (torpedo intercept):** Roll `3d6 + Sensors` vs TN 12 + attacking ship's Sensors. On success: torpedo destroyed before impact. Using PDCs for point defense means they can't fire offensively this phase.

### Phase 6: Attack Damage Resolution
Calculate incoming damage:
- Base damage = weapon dice roll
- Subtract target's Hull Rating
- Each active **Loss condition** reduces final damage by 1d6 (max 2 reductions)
- If damage > 0 after reductions: Hull Points reduced
- If damage takes HP to 0 **OR** ship already has 2+ Losses when this hit lands: **Taken Out**
- Otherwise if damage was dealt: check if a **Loss condition** is generated (GM discretion or use table in corebook)

### Phase 7: Damage Control
**Who acts:** Engineer (Intelligence — Engineering)
**Advanced Test:** TN 11, with **Threshold = Active Losses × 5**
Each roll adds successful degrees to a running total. When the total meets the Threshold, one Loss condition is removed (engineer's choice which one). The test resets after each removal.

---

## Loss Conditions Table

| Condition | Effect | Notes |
|-----------|--------|-------|
| Engines Damaged | Cannot shift range; −2 to Piloting | Stuck at current range band |
| Sensors Damaged | −2 Sensors → Attack TN and Evasion TN drop 2 | Auto-calculated via sensor stat |
| Weapons Disabled | One weapon system offline | GM specifies which |
| Hull Breach | Crew takes 1d6/round without suits | Requires sealing action |
| Collateral Damage | One crew member takes weapon damage | Attacker chooses who |
| Comms Offline | No Command SP; −3 to Communication | Commander can't use Leadership stunts |
| Life Support Damaged | Time pressure: limited rounds until critical | GM sets countdown |

**Taken Out:** Ship is removed from combat. Attacker chooses outcome:
- **Crippled** — adrift, crew survives, ship may be recoverable
- **Helpless** — can be boarded (boarding action rules apply)
- **Destroyed** — total hull loss; crew must reach escape pods

---

## Known Limitations (DiceCloud Implementation)

1. **Drama Die tracking** — DiceCloud doesn't distinguish individual dice in a 3d6 roll. Players must track which physical die is the Drama Die themselves, or use a separate roll if the system needs the Drama Die value explicitly.

2. **SP spending** — Stunt Points must be tracked manually. No automated "SP spend" mechanic in the current implementation.

3. **Range band enforcement** — `rangeBand` is a manual stat. Weapon range restrictions (e.g., can't fire torpedoes at Close range) must be tracked by the player.

4. **Advanced Tests** — Damage Control uses an Advanced Test mechanic (running total across multiple rolls). DiceCloud has no built-in Advanced Test tracker; use the Journal tab or a separate resource attribute as a progress tracker.

5. **EW Points** — Generated each round but no automated EW effects. Track manually and apply effects as toggled conditions.

6. **Ship sheet slot** — Ships use `libraryTags: ['ship']` not `['base']`. To fill a ship's slot, use the Build tab and look for the ship slot (if you set one up), or add properties directly from the library.

---

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/insert-expanse-library.js` | Creates the Expanse character library in MongoDB |
| `scripts/insert-expanse-ship-library.js` | Creates the Expanse ship library |
| `scripts/create-expanse-sample-character.js` | Creates Jadamantha Holland (Belter negotiator, L1) |
| `scripts/create-expanse-sample-ship.js` | Creates the Rocinante (MCRN corvette) |
| `docs/vibe-hack-coc-results.md` | VH-001 results for comparison |
| `docs/proposed-refactors.md` | Planned code changes to improve multi-system support |
