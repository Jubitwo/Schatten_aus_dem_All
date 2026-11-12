# Physik – Schatten aus dem All

Responsive, interaktive Lernseite für Physik Klasse 7. Das Projekt läuft ohne Build-Schritt und ohne notwendige externe JavaScript-Bibliotheken.

## Inhalte

- Modelle zu Erdrotation, Mondphasen, Jahreszeiten sowie Sonnen- und Mondfinsternissen
- Hilfekarten, Arbeitsaufträge, Rückmeldungen und bewerteter Selbsttest
- Druck-Arbeitsfassung und direkt herunterladbares PDF
- Tastaturbedienung, sichtbarer Fokus, Touch-Regler und reduzierte Bewegung

Größen und Abstände der SVG-Modelle sind schematisch und nicht maßstabsgetreu. Die Google Fonts in `style.css` sind optional; die Seite verwendet Systemschrift-Fallbacks, wenn keine Netzwerkverbindung besteht.

## Lokal ansehen

Im Projektordner einen lokalen Webserver starten, zum Beispiel:

```sh
python3 -m http.server 8000
```

Dann `http://localhost:8000` öffnen.

## GitHub Pages

Die Dateien in diesem Repository bilden die Website-Wurzel. Der Workflow in `.github/workflows/pages.yml` veröffentlicht sie bei jedem Push auf `main` über GitHub Pages. Nach erfolgreicher Bereitstellung ist die Seite unter `https://jubitwo.github.io/Schatten_aus_dem_All/` erreichbar.
