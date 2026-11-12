#!/usr/bin/env python3
"""Generate the printable four-page worksheet PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "arbeitsblatt.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT = 18 * mm
RIGHT = 18 * mm
TOP = 17 * mm
BOTTOM = 17 * mm
CONTENT_WIDTH = PAGE_WIDTH - LEFT - RIGHT
INK = colors.HexColor("#183147")
TEAL = colors.HexColor("#176f77")
LINE = colors.HexColor("#879398")

BODY = ParagraphStyle(
    "Body",
    fontName="Helvetica",
    fontSize=10.4,
    leading=14.2,
    textColor=INK,
    spaceAfter=5,
)
SMALL = ParagraphStyle(
    "Small",
    parent=BODY,
    fontSize=9.6,
    leading=13,
)
TITLE = ParagraphStyle(
    "Title",
    fontName="Helvetica-Bold",
    fontSize=21,
    leading=24,
    alignment=TA_CENTER,
    textColor=INK,
    spaceAfter=7,
)
SECTION = ParagraphStyle(
    "Section",
    fontName="Helvetica-Bold",
    fontSize=14,
    leading=17,
    textColor=TEAL,
    spaceBefore=5,
    spaceAfter=7,
)
BOX_LABEL = ParagraphStyle(
    "BoxLabel",
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=13,
    textColor=INK,
)


def paragraph(pdf, text, y, style=BODY, width=CONTENT_WIDTH):
    item = Paragraph(text, style)
    _, height = item.wrap(width, PAGE_HEIGHT)
    item.drawOn(pdf, LEFT, y - height)
    return y - height - style.spaceAfter


def section(pdf, text, y):
    return paragraph(pdf, text, y, SECTION)


def answer_lines(pdf, y, count=2, spacing=8 * mm):
    for _ in range(count):
        y -= spacing
        pdf.setStrokeColor(LINE)
        pdf.setLineWidth(0.55)
        pdf.line(LEFT, y, PAGE_WIDTH - RIGHT, y)
    return y - 5 * mm


def sketch_box(pdf, x, top, width, height, label=None):
    label_height = 8 * mm if label else 0
    if label:
        item = Paragraph(label, BOX_LABEL)
        _, wrapped_height = item.wrap(width, label_height)
        item.drawOn(pdf, x + 2 * mm, top - wrapped_height)
    box_top = top - label_height
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(0.7)
    pdf.rect(x, box_top - height, width, height)
    return box_top - height


def page_header(pdf, page, title, name=True):
    y = PAGE_HEIGHT - TOP
    pdf.setFillColor(TEAL)
    pdf.setFont("Helvetica-Bold", 8.5)
    pdf.drawString(LEFT, y, f"PHYSIK · KLASSE 7 · ARBEITSBLATT {page}/4")
    y -= 9 * mm
    y = paragraph(pdf, title, y, TITLE)
    if name:
        y = paragraph(
            pdf,
            "Name: ____________________________________________"
            " &nbsp;&nbsp; Datum: ____________________",
            y,
            SMALL,
        )
    pdf.setStrokeColor(TEAL)
    pdf.setLineWidth(1)
    pdf.line(LEFT, y, PAGE_WIDTH - RIGHT, y)
    return y - 7 * mm


def page_footer(pdf, page):
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(colors.HexColor("#596d7d"))
    pdf.drawString(LEFT, 9 * mm, "Physik – Schatten aus dem All")
    pdf.drawRightString(PAGE_WIDTH - RIGHT, 9 * mm, f"Seite {page} von 4")


def check_room(y, page):
    if y < BOTTOM:
        raise ValueError(f"Worksheet page {page} does not fit: content ends at {y / mm:.1f} mm")


def build():
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    pdf.setTitle("Physik – Schatten aus dem All: Arbeitsblatt")
    pdf.setAuthor("Physik-Lernlabor")

    y = page_header(pdf, 1, "Schatten aus dem All")
    y = paragraph(
        pdf,
        "<b>So arbeitest du:</b> Lies den Auftrag, mache erst eine Vorhersage und prüfe sie "
        "dann mit dem Modell. Zeichne und erkläre deine Beobachtung.",
        y,
    )
    y = section(pdf, "1 · Tag und Nacht", y)
    y = paragraph(
        pdf,
        "Die Sonne beleuchtet immer eine Hälfte der Erde. Durch die Erdrotation wandert ein Ort "
        "durch Tag und Nacht. Eine Drehung dauert ungefähr 24 Stunden.",
        y,
    )
    y = paragraph(
        pdf,
        "<b>Vorhersage:</b> Wenn dein Ort auf die beleuchtete Erdseite dreht, ist dort "
        "( &nbsp; ) Tag &nbsp;&nbsp; ( &nbsp; ) Nacht.",
        y,
    )
    y = paragraph(
        pdf,
        "Erkläre mit den Wörtern <i>Sonne, Erdrotation, Tagseite</i>: Warum wechseln Tag und Nacht?",
        y,
    )
    y = answer_lines(pdf, y, 3)
    y = sketch_box(
        pdf,
        LEFT,
        y,
        CONTENT_WIDTH,
        112 * mm,
        "Skizziere die Erde, Sonnenstrahlen und einen Ort bei Tag und bei Nacht:",
    )
    y -= 4 * mm
    y = paragraph(pdf, "<b>Merke:</b> Die sonnenabgewandte Hälfte liegt im Dunkeln.", y)
    check_room(y, 1)
    page_footer(pdf, 1)
    pdf.showPage()

    y = page_header(pdf, 2, "Ein Mond – acht Phasen")
    y = paragraph(
        pdf,
        "Die Sonne beleuchtet stets eine Mondhälfte. Beim Umlauf sehen wir von der Erde aus "
        "unterschiedlich viel davon. Normale Mondphasen entstehen nicht durch den Erdschatten.",
        y,
    )
    y = paragraph(
        pdf,
        "<b>Auftrag:</b> Zeichne Sonne, Erde und Mond bei Neumond und Vollmond. Markiere in "
        "jedem Mond, welche Hälfte von der Sonne beleuchtet wird.",
        y,
    )
    gap = 7 * mm
    box_width = (CONTENT_WIDTH - gap) / 2
    bottom = min(
        sketch_box(pdf, LEFT, y, box_width, 62 * mm, "Neumond"),
        sketch_box(pdf, LEFT + box_width + gap, y, box_width, 62 * mm, "Vollmond"),
    )
    y = bottom - 7 * mm
    y = paragraph(pdf, "Schreibe die acht Mondphasen in der richtigen Reihenfolge auf:", y)
    y = answer_lines(pdf, y, 2)
    y = paragraph(pdf, "Warum sehen wir im Monatslauf verschieden viel von der beleuchteten Mondhälfte?", y)
    y = answer_lines(pdf, y, 3)
    y = paragraph(
        pdf,
        "Was ist bei Mondrotation und Umlauf synchronisiert? Warum wendet der Mond der Erde "
        "ungefähr immer dieselbe Seite zu?",
        y,
    )
    y = answer_lines(pdf, y, 3)
    check_room(y, 2)
    page_footer(pdf, 2)
    pdf.showPage()

    y = page_header(pdf, 3, "Achse, Sonnenstand und Tageslänge")
    y = paragraph(
        pdf,
        "Die Erdachse ist um etwa 23,5° geneigt und bleibt während des Umlaufs annähernd in "
        "dieselbe Richtung ausgerichtet.",
        y,
    )
    y = paragraph(
        pdf,
        "<b>Auftrag:</b> Trage Sommer, Herbst, Winter und Frühling auf der Nordhalbkugel ein. "
        "Zeichne die Erdachse an jeder Position parallel.",
        y,
    )
    y = sketch_box(pdf, LEFT, y, CONTENT_WIDTH, 91 * mm, "Erdbahn mit vier Jahreszeiten:")
    y -= 5 * mm
    y = paragraph(pdf, "Was ändert sich im Sommer an Sonnenstand und Tageslänge?", y)
    y = answer_lines(pdf, y, 2)
    y = paragraph(pdf, "Warum ist auf der Südhalbkugel dann Winter?", y)
    y = answer_lines(pdf, y, 2)
    y = paragraph(
        pdf,
        "<b>Kreuze an:</b> Die Jahreszeiten entstehen hauptsächlich durch "
        "( &nbsp; ) den wechselnden Abstand zur Sonne &nbsp;&nbsp; "
        "( &nbsp; ) Achsenneigung und Umlauf.",
        y,
    )
    y = paragraph(pdf, "Wie verteilt ein steiler Sonnenstand die Lichtenergie auf eine Fläche?", y)
    y = answer_lines(pdf, y, 2)
    check_room(y, 3)
    page_footer(pdf, 3)
    pdf.showPage()

    y = page_header(pdf, 4, "Finsternisse und Blutmond")
    y = paragraph(
        pdf,
        "<b>Auftrag:</b> Ergänze die Reihenfolge. Zeichne Sonne, Erde oder Mond sowie Lichtstrahlen, "
        "Halbschatten und Kernschatten ein.",
        y,
    )
    y = paragraph(pdf, "<b>Sonnenfinsternis:</b> Sonne – __________________ – __________________", y)
    y = sketch_box(pdf, LEFT, y, CONTENT_WIDTH, 48 * mm, "Licht und Mondschatten auf der Erde:")
    y -= 4 * mm
    y = paragraph(pdf, "<b>Mondfinsternis:</b> Sonne – __________________ – __________________", y)
    y = sketch_box(pdf, LEFT, y, CONTENT_WIDTH, 48 * mm, "Licht sowie Erdhalb- und Kernschatten:")
    y -= 4 * mm
    y = paragraph(pdf, "Warum gibt es wegen der geneigten Mondbahn nicht jeden Monat Finsternisse?", y)
    y = answer_lines(pdf, y, 2, spacing=7 * mm)
    y = paragraph(
        pdf,
        "Wie kann bei einer totalen Mondfinsternis rötliches Sonnenlicht den Mond erreichen?",
        y,
    )
    y = answer_lines(pdf, y, 2, spacing=7 * mm)
    y = paragraph(
        pdf,
        "<b>Abschluss:</b> Erkläre in einem Satz, warum Mondphasen und eine Mondfinsternis "
        "verschiedene Vorgänge sind.",
        y,
    )
    y = answer_lines(pdf, y, 2, spacing=7 * mm)
    check_room(y, 4)
    page_footer(pdf, 4)
    pdf.save()


if __name__ == "__main__":
    build()
    print(f"Arbeitsblatt erstellt: {OUTPUT}")
