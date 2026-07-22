---
title: Hydration
---

Dieses Projekt nutzt die **Islands-Hydration**-Architektur von [HonoX](https://github.com/honojs/honox) und [**@hono/vite-ssg**](https://github.com/honojs/vite-plugins/tree/main/packages/ssg) für **SSG**, die statische Generierung von Seiten, die standardmäßig **statisches HTML** ausliefert; nur Komponenten, die wirklich clientseitige Interaktivität benötigen, werden zu Islands (Client-JS-Snippets) „hochgestuft".

> Das Hydration-Verhalten jeder Komponente läuft über das Prädikat `shouldHydrate`
> in `app/components/ui/island-utils.ts`. Jede Entscheidung darüber, _wann statisches HTML gerendert wird_
> und _wann ein clientseitiges Island eingehängt wird_, wird hier aufgelöst — siehe
> [Hydration](/docs/Hydration) für das vollständige Tier-Modell, die Entscheidungsregeln und die
> Klassifizierung pro Komponente.

1. **Kein redundantes JS** — Komponenten ohne Interaktion müssen nie ein Hydration-Skript ausliefern.
2. **Kein stilles Versagen** — Komponenten, die _tatsächlich_ Interaktion benötigen, sollten automatisch hydratisieren, selbst wenn der Aufrufer vergisst, `interactive` zu übergeben.
3. **Einzige Quelle der Wahrheit** — jede „Sollte das hydratisieren?"-Entscheidung läuft über eine einzige gemeinsame `shouldHydrate`-Funktion und beseitigt komponentenspezifische Ad-hoc-`if (interactive)`-Zweige.

## Das Kernprädikat

`app/components/ui/island-utils.ts`:

```ts
/**
 * Decide whether a component should hydrate as a client-side island.
 *
 * @param interactive - the component's `interactive` prop (boolean | undefined)
 * @param hasSignal   - whether the component carries a "behaviour signal": an event
 *                      handler (onClick / onValueChange …) or a controlled/default
 *                      state (value / checked / open …) that only makes sense with JS.
 *
 * Semantics:
 *  - interactive === false → never hydrate (explicit opt-out)
 *  - interactive === true  → always hydrate (explicit opt-in)
 *  - interactive omitted    → hydrate iff hasSignal is true
 */
export function shouldHydrate(interactive: unknown, hasSignal: boolean): boolean {
	return interactive !== false && Boolean(interactive || hasSignal);
}
```

### Wahrheitstabelle

| `interactive` | `hasSignal` | Ergebnis | Bedeutung |
| --- | --- | --- | --- |
| `false` | beliebig | `false` | Hydration ausdrücklich verboten (rein statisch) |
| `true` | beliebig | `true` | Hydration ausdrücklich erzwungen |
| `undefined` | `true` | `true` | Automatische Erkennung: Signal vorhanden → hydratisieren |
| `undefined` | `false` | `false` | Automatische Erkennung: kein Signal → statisch |

***

## Das 3-Tier-Modell

### Tier 1 — Automatisch interaktiv

> **Kernregel: `shouldHydrate(interactive, true)`**

Diese Komponenten _sind_ Interaktion — ihr gesamter Wert hängt von Client-JS ab
(Overlays, Modals, Ziehgriffe, Ein-/Ausklappen). Sie hydratisieren,
sofern der Aufrufer nicht ausdrücklich `interactive={false}` übergibt.

Gilt für:

- Overlay-/Popover-Familien (Tooltip, Hover-Card, Popover, Menu)
- Modals / Drawers / Ziehen (Dialog, Drawer, Splitter)
- Ein-/Ausklappen (Collapsible)
- Reine Client-Singletons (Toast)

### Tier 2 — Intelligente automatische Erkennung

> **Kernregel: `shouldHydrate(interactive, hasSignal)`**

Diese Komponenten sind _standardmäßig statisch und nur interaktiv, wenn ein Signal vorhanden ist_.
Es handelt sich um **kontrollierte/unkontrollierte Formular-Steuerelemente oder auswählbare Gruppen**: Hydration ist nur
relevant, wenn ein Zustand (`value` / `checked` / `defaultValue`) oder ein Handler
(`onChange` / `onClick` …) bereitgestellt wird; andernfalls genügt statisches Markup.

Gilt für:

- Formular-Steuerelemente (button, checkbox, switch, textarea, field, slider, combobox, radio-group)
- Auswählbare Gruppen (segment-group, toggle-group)
- Tabellen mit Zeilenklicks (table)
- Avatar mit einem `src` (der asynchrone Lade-/Fehler-Lebenszyklus des Bildes ist ein reines Client-Signal)
- Pagination / tags-field / pin-field (Zustand + Handler; eine `type="link"`-Pagination, die
  `getPageUrl` bereitstellt, ist reine Navigation und bleibt statisch)

### Tier 3 — Präsentational

> **Hängt niemals ein Island ein**

Rein typografische / dekorative Komponenten ohne Client-Verhalten. Sie **dürfen keinen**
**`interactive`-Prop deklarieren**.

Gilt für:

- Typografie (text, heading, badge)
- Layout (group, absolute-center, fieldset)
- Statusanzeigen (alert, breadcrumb, loader, skeleton, spinner, progress)
- Grafik (icon)

***

## Vollständige Komponentenklassifizierung

> Status-Legende: `✅` entspricht der Konvention; `⚠️` weicht von der Konvention ab und
> muss migriert werden (siehe Abschnitt 7). Nach dem letzten Bereinigungsdurchlauf sind **alle Komponenten `✅`**.

### Tier 1 (automatisch interaktiv)

| Komponente | Regel | Auslöser | Status |
| --- | --- | --- | --- |
| `dialog` | `shouldHydrate(interactive, true)` | Hydratisiert immer, außer bei `interactive={false}` | ✅ `dialog.tsx` |
| `drawer` | `shouldHydrate(interactive, true)` | Hydratisiert immer, außer bei `interactive={false}` | ✅ `drawer.tsx` |
| `splitter` | `shouldHydrate(interactive, true)` | Hydratisiert immer, außer bei `interactive={false}` | ✅ `splitter.tsx` |
| `tooltip` | `shouldHydrate(interactive, true)` | Hydratisiert immer | ✅ `tooltip.tsx` |
| `hover-card` | `shouldHydrate(interactive, true)` | Hydratisiert immer | ✅ `hover-card.tsx` |
| `popover` | `shouldHydrate(interactive, true)` | Hydratisiert immer | ✅ `popover.tsx` |
| `menu` | `shouldHydrate(interactive, true)` | Hydratisiert immer | ✅ `menu.tsx` |
| `select` | `shouldHydrate(interactive, true)` | Hydratisiert immer — das Öffnen des Dropdowns und das Auswählen eines Elements erfordern JS; es gibt keinen statischen Fallback (das native `<select>` ist visuell ausgeblendet und existiert nur für das Absenden von Formularen) | ✅ `select.tsx` (Tier 1) |
| `collapsible` | `shouldHydrate(interactive, true)` | Hydratisiert immer (Ein-/Ausklappen benötigt JS) | ✅ `collapsible.tsx` (Tier 1) |
| `toast` | Immer ein Island (Client-Singleton) | Kein Prop, immer ein Island | ✅ `toast.tsx` |

### Tier 2 (intelligente automatische Erkennung)

| Komponente | Verhaltenssignal (`hasSignal` ist true, wenn…) | Status |
| --- | --- | --- |
| `button` | `onClick` / `onPointerDown` / `onSubmit` | ✅ `button.tsx` |
| `card` | `onClick` / `onPointerDown` | ✅ `card.tsx` |
| `table` | ein beliebiges `row.onClick` | ✅ `table.tsx` |
| `segment-group` | `value` / `defaultValue` / `onValueChange` | ✅ `segment-group.tsx` |
| `toggle-group` | `value` / `defaultValue` / `onValueChange` | ✅ `toggle-group.tsx` |
| `slider` | `value` / `defaultValue` / `onChange` / `onDraggingChange` | ✅ `slider.tsx` |
| `checkbox` | `checked` / `defaultChecked` / `onCheckedChange` | ✅ `checkbox.tsx` |
| `switch` | `checked` / `defaultChecked` / `onCheckedChange` | ✅ `switch.tsx` |
| `textarea` | `value` / `defaultValue` / `onValueChange` / `validator` / `minLength` | ✅ `textarea.tsx` |
| `field` | `value` / `defaultValue` / `onValueChange` / `validator` / `minLength` | ✅ `field.tsx` |
| `combobox` | `open` / `inputValue` / `onToggle` / `onInputChange` / `onItemSelect` | ✅ `combobox.tsx` |
| `radio-group` | `value` / `defaultValue` / `onValueChange` | ✅ `radio-group.tsx` |
| `avatar` | `src` (asynchroner Bild-Lade-/Fehler-Lebenszyklus) | ✅ `avatar.tsx` (Tier 2) |
| `pagination` | `onPageChange` oder ein `page` / `defaultPage` / `pageSize` / `defaultPageSize` außerhalb des Link-Modus | ✅ `pagination.tsx` |
| `tags-field` | `onValueChange` / `onInputValueChange` / `value` / `inputValue` / `defaultValue` / `defaultInputValue` | ✅ `tags-field.tsx` |
| `pin-field` | `value` / `defaultValue` / `onValueChange` / `onValueComplete` / `onValueInvalid` / `validator` / `autoSubmit` / `onAutoSubmit` | ✅ `pin-field.tsx` |
| `paginated-table` | Immer ein Island (verwaltet internen Paginierungszustand) | ✅ `paginated-table.tsx` (Tier-2-Logik) |
| `date-picker` | `value` / `defaultValue` / `focusedValue` / `open` / `defaultOpen` / `onValueChange` / `onOpenChange` / (Tastatur-/Klick-/Tippereignisse) | ✅ `date-picker.tsx` |
| `color-picker` | `value` / `defaultValue` / `format` / `defaultFormat` / `open` / `defaultOpen` / `onValueChange` / `onFormatChange` / `onOpenChange` / (Zeiger-/Tastatur-/Eingabeereignisse) | ✅ `color-picker.tsx` |

### Tier 3 (präsentational)

| Komponente | Anmerkungen | Status |
| --- | --- | --- |
| `text` | Typografischer Text | ✅ |
| `heading` | Überschrift | ✅ |
| `badge` | Badge | ✅ (toter `interactive`-Prop entfernt) |
| `fieldset` | Formular-Fieldset | ✅ (toter `interactive`-Prop entfernt) |
| `alert` | Hinweisbox | ✅ |
| `breadcrumb` | Breadcrumb | ✅ |
| `group` | Layout-Gruppierung | ✅ |
| `absolute-center` | Zentrierendes Layout | ✅ |
| `loader` | Ladeanzeige | ✅ |
| `skeleton` | Skeleton-Screen | ✅ |
| `spinner` | Spinner-Anzeige | ✅ |
| `progress` | Fortschrittsbalken (wertgesteuert, standardmäßig statisch) | ✅ |
| `icon` | SVG-Icon-Wrapper (nur Größe/Farbe, kein Client-Zustand) | ✅ `icon.tsx` |

***

## Auslösebedingungen pro Tier

### Tier-1-Bedingungen

- Die Kerninteraktion der Komponente (Öffnen eines Overlays, Ziehen eines Splitters, Ein-/Ausklappen,
  Modal-Fokusfalle) **lässt sich nicht in reinem HTML ausdrücken**, daher ist `hasSignal`
  standardmäßig `true`.
- Der einzige zulässige Opt-out ist `interactive={false}` (z. B. das erzwungene Deaktivieren eines Overlays in einem
  rein statischen Dokument).
- `toast` ist ein Sonderfall: Es ist ein globales Client-Singleton (`toaster.create(...)`) und stellt
  keinen `interactive`-Prop bereit.

### Tier-2-Bedingungen

Das `hasSignal` jeder Komponente ist ein boolesches ODER über „Ist dieser Prop definiert?":

```typescript
// Typical pattern (segment-group shown)
const hasSignal =
	rest.value !== undefined ||
	rest.defaultValue !== undefined ||
	rest.onValueChange !== undefined;
if (shouldHydrate(interactive, hasSignal)) return <SegmentGroupIsland {...rest} />;
return <Root {...rest}>{/* static structure */}</Root>;
```

Entscheidungsprinzipien:

1. **Kontrollierter Zustand** (`value` / `checked` / `open` / `inputValue`) → benötigt JS, um synchron zu bleiben.
2. **Unkontrollierter Anfangswert** (`defaultValue` / `defaultChecked`) → benötigt JS, um den internen Zustand zu halten.
3. **Event-Handler** (`onChange` / `onClick` / `onValueChange` / `onItemSelect` …) → benötigt JS, um zu reagieren.
4. **Validierung / Einschränkungen** (`validator` / `minLength`) → benötigt JS zur Ausführung.
5. **Asynchrone / reine Client-Signale** — `src` bei `avatar` (impliziert einen Lade-/Fehler-Lebenszyklus)
   oder jeder Prop, dessen einziger Zweck ein clientseitiger Effekt ist (Medien, Intersection, Lazy
   Loading). Diese lassen sich ohne JS nicht auflösen und zählen daher als Signal.
6. Ist eines der oben genannten Elemente vorhanden, wird `hasSignal` true, was die Hydration auslöst;
   fehlen alle, wird die Komponente als rein statisches Markup gerendert.

> **`avatar` ist unter den Tier-2-Komponenten ein Sonderfall:** Sein Signal ist das asynchrone Ladesignal `src`.
> Wenn `src` vorhanden ist, benötigt das Bild eine clientseitige Lade-/Fehlerbehandlung, daher
> hydratisiert `shouldHydrate(interactive, Boolean(src))` es; ein `avatar` ohne `src` (z. B. ein
> Initialen-Fallback) bleibt statisch. Ein explizites `interactive={false}` unterdrückt die Hydration selbst
> dann, wenn `src` existiert (konsistent mit der bibliotheksweiten „`false` gewinnt"-Semantik).

> **Ausnahme im Link-Modus von `pagination`:** Eine `type="link"`-Pagination, die `getPageUrl` bereitstellt,
> ist reine Navigation (jede Seite ist ein Anker) und bleibt daher statisch, sofern kein expliziter
> `onPageChange`-Handler bereitgestellt wird. Nur im Button-Modus (oder mit `onPageChange`) zählen die
> Props `page` / `defaultPage` / `pageSize` / `defaultPageSize` als Signale.

### Tier-3-Bedingungen

- Die Komponente hält keinen Client-Zustand und reagiert auf keine Ereignisse.
- Sie deklariert keinen `interactive`-Prop. (Historisch deklarierten `badge` / `heading` / `text` /
  `fieldset` ihn fälschlicherweise und ließen `interactive="true"` auf das DOM durchsickern; das wurde
  bei der Bereinigung entfernt.)

***

## Entscheidungs-Checkliste für neue Komponenten

Gehen Sie die Liste der Reihe nach durch; halten Sie beim ersten Treffer an:

1. **Hängt die Existenz vollständig von Client-JS ab?**
   Overlay / Modal / Ziehen / Ein-/Ausklappen → **Tier 1**, verwenden Sie
   `shouldHydrate(interactive, true)`.
2. **Ist es ein Formular-Steuerelement oder eine visuell auswählbare Komponente, die kontrolliert oder**
\*\*   unkontrolliert sein kann?\*\*
   button / checkbox / switch / slider / combobox / Tabelle mit Zeilenklick … → **Tier 2**,
   definieren Sie `hasSignal` (Zustand + Handler) und rufen Sie dann `shouldHydrate(interactive, hasSignal)` auf.
3. **Ist es rein typografisch / Layout / dekorativ?**
   text / heading / alert / group / progress … → **Tier 3**, kein `interactive`-Prop, kein Island.

**Verbindliche Implementierungsanforderungen:**

- Keine Komponente darf einen nackten `if (interactive) { … }`-Zweig schreiben; gehen Sie immer über `shouldHydrate`.
- `interactive` ist nur ein „Regler": `true` erzwingt, `false` verbietet, `undefined` überlässt es `hasSignal`.
- Jede Tier-1-/Tier-2-Komponente sollte ihrer `content/components/<Component>.mdx` einen `# Hydration`-Abschnitt
  hinzufügen, auf diese Datei verweisen und ihr Frontmatter-Feld `hydration` (`1` / `2` / `3`)
  entsprechend setzen.

***
