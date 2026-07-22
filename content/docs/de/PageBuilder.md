---
title: CMS-Seitenbaukasten
---

## Einführung

Der auf [Sveltia CMS](https://sveltiacms.app/en/docs/intro) basierende dynamische Seitenbaukasten ermöglicht es nicht-technischen Redakteuren, komplexe, rekursiv verschachtelte Seiten vollständig über die CMS-Benutzeroberfläche (`/admin/`) zu erstellen.

Seitenlayouts werden als JSON-Dateien in `content/pages/*.json` gespeichert und bei Bedarf kompiliert oder statisch vorab generiert (über Hono SSG) unter `/pages/[slug]`.

***

## Unterstützte Komponenten

Der Seitenbaukasten unterstützt eine reichhaltige Palette von über 40 Layout-, Typografie-, dekorativen und interaktiven Komponenten.

### 1. Struktur & Layout

* **Stack**: Gruppiert Kindelemente vertikal oder horizontal mit steuerbarer Ausrichtung, Justierung und Abstand.
* **Grid**: Responsives CSS-Grid-Layout — feste Spalten-/Zeilenanzahl oder automatische Anpassung nach minimaler Kindbreite.
* **Group**: Richtet Elemente wie Buttons eng aneinander aus (unterstützt die Eigenschaften `attached` und `grow`).
* **Fieldset**: Organisiert zusammengehörige Formularkomponenten unter einem gestylten Container mit `legend`, `helperText` und `errorText`.
* **AbsoluteCenter**: Zentriert einen einzelnen verschachtelten Block innerhalb seines Elternelements entlang einer oder beider Achsen.
* **Splitter**: Größenveränderbare Panels, getrennt durch Ziehgriffe. Wird im Seitenbaukasten immer statisch gerendert (Panel-Inhalt kann die Island-Hydration-Grenze nicht überschreiten).
* **Breadcrumb**: Navigationspfad aus verlinkten Elementen mit anpassbarem Trennzeichen.

### 2. Typografie & Inhalt

* **Heading**: Gestylte Überschriften der Stufen `h1` bis `h6` und verschiedene responsive Textgrößen.
* **Text**: Text auf Absatzebene mit anpassbaren Größen.

### 3. Anzeige & Präsentation

* **Alert**: Rendert Warn-/Erfolgs-/Fehler-/Info-Hinweise mit Standardstatus und Icons.
* **Badge**: Farbige Metadaten-Labels mit benutzerdefinierten Farbpaletten und Stilen.
* **Card**: Ein umfangreicher Container, der verschachtelte Blöcke, Kopf- und Fußzeilen sowie Bildpositionen oben/unten/links/rechts unterstützt.
* **Progress**: Rendert lineare oder kreisförmige Fortschrittsanzeigen.
* **Skeleton**: Hochgradig anpassbare Platzhalter-Skeletons (unterstützt Kreis- und mehrzeilige Textformen).
* **Loader** / **Spinner**: Ladeanzeigen mit optionalem Begleittext.
* **Table**: Statische Tabellendaten mit konfigurierbaren Spalten und einem JSON-kodierten Zeilen-Array.
* **Icon**: Rohes Inline-SVG-Markup mit Größen-/Farbsteuerung.

### 4. Interaktiv & Overlays

* **Button**: Primäre anklickbare Ziele mit Unterstützung für benutzerdefinierte Paletten, Größen und Stilvarianten.
* **Checkbox**: Kontrollkästchen für boolesche Eingaben mit barrierefreien Aria-Bindungen.
* **Combobox**: Dropdowns mit Löschaktionen und Elementlisten.
* **Collapsible**: Aufklappbare Container, die verschachtelte Komponentenbäume anzeigen/verbergen.
* **Popover**: Schwebender beschreibender Inhalt, verankert an standardmäßigen Text-Triggern.
* **Tooltip**: Kontextbezogener Hinweistext, verankert an einem Trigger-Button bei Hover/Fokus.
* **HoverCard**: Reicherer per Hover ausgelöster Inhalt als ein Tooltip, mit optionalem Titel/Beschreibung.
* **Dialog**: Vollständig fokusgefangene modale Boxen mit benutzerdefinierten Bestätigen-/Abbrechen-Buttons und benutzerdefinierter Kinderliste.
* **Drawer**: Responsive Seitenpanels, die vom Seitenrand hereingleiten, mit benutzerdefinierter Kinderliste.
* **Dropdown** (Blocktyp `menu`): Aktionsmenüs mit benutzerdefinierten abhakbaren, auswählbaren und Trenner-Optionen.

### 5. Erweitert & Daten

* **Select**: Benutzerdefiniertes Einzel-/Mehrfachauswahl-Dropdown, formularübermittelbar.
* **DatePicker**: Einzel-/Mehrfach-/Bereichs-Datumsauswahl mit einem Popup-Kalender.
* **TagsField**: Freie Liste von Zeichenketten-Tags.
* **RadioGroup** / **RadioCardGroup**: Benutzerdefinierte Radio-Listen mit barrierefreier Einzelauswahllogik.
* **SegmentGroup**: Gleitende segmentierte Steuerelemente für die Auswahl per Registerkarte.
* **Slider**: Bereichs-Schieberegler-Komponenten.
* **Switch**: Umschalter.
* **Editable**: Inline-Text zum Bearbeiten per Klick.
* **ColorPicker**: Sättigungs-/Farbton-/Alpha-Farbwähler mit Hex-/RGBA-/HSLA-Eingabe.
* **FileUpload**: Dateiauswahl per Drag-and-Drop oder Klick zum Durchsuchen.
* **Carousel**: Automatisch abspielende oder manuelle Bildershow.
* **PaginatedTable**: Interaktive dynamische Tabellenkomponenten mit Paginierungsunterstützung.
* **Pagination**: Interaktive Seitensteuerung.

***

## Architektur

### 1. CMS-Schemadefinitionen (`public/admin/config.yml`)

Wir nutzen fortgeschrittene **YAML-Anker und -Aliase** (`&` und `*`), um die Herausforderung der unendlichen Rekursion in YAML-Spezifikationen zu lösen.

* **Basis-Anker** (`button_fields`, `checkbox_fields` usw.) werden einmal deklariert.
* **Komponenten der Ebene 1** definieren flache Elemente und einen `Stack`/`Collapsible`-Container, der **Komponenten der Ebene 2** unterstützt (`*l2_components`).
* **Komponenten der Ebene 2** erlauben rekursiv eine weitere Schicht verschachtelter Container (`*l3_components`).
* Dies ermöglicht es Redakteuren, Layouts bis zu **4 Ebenen tief** zu verschachteln, ohne die Grenzen des YAML-Parsers/CMS zu überschreiten.

### 2. Layout-Renderer (`app/components/page-renderer.tsx`)

Die Layout-Engine importiert alle öffentlichen Komponentenmodule aus `app/components/ui/` und ordnet sie in einem hochperformanten, vollständig typsicheren JSX-Compiler zu.

* Eingabetypen werden stark in standardmäßige `unknown`-Record-Dictionaries gecastet, um Typkonvertierung zu verhindern und die Biome-Lint-Prüfungen vollständig sauber zu halten.
* Verschachtelte Container werden rekursiv über verschachtelte Aufrufe der Komponente `<PageRenderer content={...} />` verarbeitet.

***

## Content-Build-Pipelines

Seitenbaukasten-Layouts sind einer von drei Inhaltstypen unter `content/`, die jeweils mit Vites `import.meta.glob` erkannt und über ihre eigene Route gerendert werden. Alle drei werden auf dieselbe Weise statisch generiert: Die `ssgParams`-Middleware einer Route zählt zur Build-Zeit jede Datei in ihrer Sammlung auf, und `bun run build` (über `@hono/vite-ssg`) durchläuft diese Parameter, um pro Slug eine statische HTML-Datei nach `dist/` vorab zu rendern.

### 1. JSON-Seitenlayouts (`content/pages/*.json`)

* Geladen mit `import.meta.glob("/content/pages/*.json", { import: "default" })` in `app/routes/pages/[slug].tsx`.
* Jede Datei wird als reines JSON geparst — kein Markdown involviert — und ihr `content`-Array wird direkt an `<PageRenderer />` übergeben (siehe Architektur oben), das es rekursiv in die passenden UI-Komponenten kompiliert.
* Dies ist die einzige der drei Pipelines ohne separaten Parse-/Kompilierschritt: Das JSON _ist_ der Renderbaum.

### 2. Reines Markdown (`content/posts/*.md`, `content/docs/*.md`)

* Geladen mit `import.meta.glob(..., { query: "?raw", import: "default" })`, das die rohe Markdown-Quelle als Zeichenkette statt als kompiliertes Modul zurückgibt.
* Zur Anfrage-/Build-Zeit geparst von `app/utils/markdown.ts`, einer `remark`/`rehype`-Pipeline (`remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-stringify`): `parseFrontmatter()` trennt den YAML-Frontmatter-Block vom Rumpf, und `markdownToHtml()` wandelt den Rumpf in eine HTML-Zeichenkette um.
* Die resultierende Zeichenkette wird über `dangerouslySetInnerHTML` injiziert (siehe `app/lib/posts.ts` und `app/lib/docs.ts`) — es ist kein JSX beteiligt, daher kann diese Pipeline keine lebendigen Komponenten einbetten.
* Blog-Beiträge lassen ihren Rumpf zusätzlich durch `stripMarkdown()` laufen, um einen Klartext-Suchheuhaufen für `/api/*/search.json` zu erstellen.

### 3. MDX-Dokumente (`content/docs/*.mdx`)

* Vorab kompiliert vom Vite-Plugin `@mdx-js/rollup` (konfiguriert in `vite.config.ts`, auf `.mdx` beschränkt, damit es niemals die obigen rohen `.md`-Importe abfängt) unter Verwendung von `remark-frontmatter` + `remark-mdx-frontmatter` + `remark-gfm`.
* Jede `.mdx`-Datei wird zu einer echten, importierbaren Komponente (plus einem separaten `frontmatter`-Export), geladen in `app/lib/docs.ts` über ein einfaches (nicht `?raw`) `import.meta.glob`.
* Da die Ausgabe eine Komponente statt einer HTML-Zeichenkette ist, können `.mdx`-Dokumente tatsächlich gerenderte, interaktive Beispiele (z. B. eine lebendige `<Button>`-Demo) direkt in den Text einbetten — der Kompromiss dafür ist der Kompilierschritt zur Build-Zeit, den reines `.md` nicht benötigt.

`app/lib/docs.ts` lädt sowohl die `.md`- als auch die `.mdx`-Sammlungen nebeneinander und führt sie zu einer einzigen Seitennavigation zusammen, sodass es ein für Leser unsichtbares Implementierungsdetail ist, welche Pipeline ein bestimmtes Dokument verwendet — wählen Sie `.md` für reinen Text und `.mdx` nur, wenn eine Seite eine eingebettete lebendige Komponente benötigt.

***

## Beispiel-JSON-Struktur

Hier ist eine Beispiel-Layoutdatei, die eine komplexe Dashboard-Seite darstellt (`content/pages/dashboard.json`):

```json
{
  "title": "Interactive Dashboard",
  "content": [
    {
      "type": "heading",
      "text": "Dashboard Analytics",
      "as": "h1",
      "size": "3xl"
    },
    {
      "type": "stack",
      "direction": "vertical",
      "gap": "6",
      "children": [
        {
          "type": "card",
          "title": "Welcome User!",
          "description": "Here is your system status.",
          "variant": "outline",
          "children": [
            {
              "type": "alert",
              "status": "success",
              "title": "All Systems Operational",
              "variant": "surface"
            }
          ]
        },
        {
          "type": "fieldset",
          "legend": "User Preferences",
          "children": [
            {
              "type": "switch",
              "defaultChecked": true,
              "text": "Enable Push Notifications"
            },
            {
              "type": "checkbox",
              "text": "Subscribe to Newsletter"
            }
          ]
        }
      ]
    }
  ]
}
```
