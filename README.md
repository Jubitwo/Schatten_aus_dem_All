# Physik – Schatten aus dem All

Responsive, interaktive Lernseite für Physik Klasse 7. Das Projekt läuft ohne Build-Schritt und ohne notwendige externe JavaScript-Bibliotheken.

## Inhalte

- Modelle zu Erdrotation, Mondphasen, Jahreszeiten sowie Sonnen- und Mondfinsternissen
- Hilfekarten, Arbeitsaufträge, Rückmeldungen und bewerteter Selbsttest
- vierseitiges Druck-Arbeitsblatt und direkt herunterladbares PDF
- Tastaturbedienung, sichtbarer Fokus, Touch-Regler und reduzierte Bewegung

Größen und Abstände der SVG-Modelle sind schematisch und nicht maßstabsgetreu. Die Seite verwendet Systemschriften und benötigt für ihre Kernfunktionen keine externen Ressourcen.

## Lokal ansehen

Im Projektordner einen lokalen Webserver starten, zum Beispiel:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## Arbeitsblatt-PDF aktualisieren

Das vierseitige PDF wird aus `tools/generate_worksheet.py` erzeugt. Dafür wird ReportLab benötigt:

```sh
python3 -m pip install reportlab
python3 tools/generate_worksheet.py
```

Die erzeugte Datei `arbeitsblatt.pdf` wird von der Website direkt zum Download angeboten.

## GitHub Pages

Die Dateien in diesem Repository bilden die Website-Wurzel. Der Workflow in `.github/workflows/pages.yml` veröffentlicht sie bei jedem Push auf `main` über GitHub Pages. Nach erfolgreicher Bereitstellung ist die Seite unter `https://jubitwo.github.io/Schatten_aus_dem_All/` erreichbar.
