# 🛍️ Headless Shop – Next.js + Directus

Ein SEO-freundlicher, performanter Produkt-Shop auf Basis von **Next.js** (Frontend) und **Directus** (Headless CMS).

Ziel ist eine saubere Trennung zwischen:

- Content Management (Directus)
- API-Client-Schicht (zentral, testbar, wiederverwendbar)
- Präsentationslogik (Next.js)

---

# 📦 Inhaltsverzeichnis

- [Projektziel](#-projektziel)
- [Architektur](#-architektur)
- [API-Client-Schicht](#-api-client-schicht)
- [Content-Modell (Directus)](#-content-modell-directus)
- [Rendering-Strategie](#-rendering-strategie)
- [Features](#-features)
- [Sicherheit & Publishing-Regeln](#-sicherheit--publishing-regeln)
- [Environment Variablen](#-environment-variablen)
- [Testbarkeit](#-testbarkeit)
- [Deployment](#-deployment)
- [Erweiterungsmöglichkeiten](#-erweiterungsmöglichkeiten)

---

# Projektmanagment

- Notion: https://material-roadway-99c.notion.site/ScrumBoard-319317fe02fd80c192eac76e7b7b9416?source=copy_link
  
# 🎯 Projektziel

Dieses Projekt implementiert eine produktive Headless-Commerce-Struktur mit folgenden Kernzielen:

- Produkte werden ausschließlich in Directus gepflegt
- Die Website zeigt nur veröffentlichte Produkte
- SEO-optimiertes Rendering (SSR/SSG/ISR)
- Zentrale API-Logik ohne Directus-Leaks in UI-Komponenten
- Saubere Fehlerbehandlung
- Testbare Datenzugriffe

---

# 🏗 Architektur

## High-Level Überblick

```
Directus (CMS)
      ↓
API Client Layer (/lib/directus)
      ↓
Next.js Server Components / SSR / ISR
      ↓
UI Komponenten
```

### Prinzipien

- Keine Directus-spezifischen Response-Strukturen im UI
- Mapping in ein internes Datenmodell
- Serverseitige API-Calls bei Secret-Nutzung
- Konsistente Fehlerobjekte

---

# 🔌 API-Client-Schicht

Zentrale Datenzugriffe über ein dediziertes Modul.

## Struktur

```
/lib/directus
  ├── client.ts
  ├── products.ts
  └── types.ts
```

## Anforderungen

- Zentrale REST-Kommunikation
- Kapselung von:
  - Base URL
  - Auth Token
- Methoden:
  - `getProducts()`
  - `getProductBySlug(slug)`
  - `getFilteredProducts(filters)`
- Einheitliche Fehlerstruktur
- Mockbare Fetch-Implementierung
- Keine ungehandelten `throw` in UI

## Beispiel Fehlerobjekt

```ts
export type ApiError = {
  code: string;
  message: string;
  status: number;
};
```

---

# 🗂 Content-Modell (Directus)

## Collection: `products`

| Feld | Typ | Pflicht |
|------|------|---------|
| name | string | ✅ |
| slug | string | ✅ |
| description | text | ✅ |
| price | decimal | ✅ |
| status | enum (draft / published) | ✅ |
| publish_date | datetime | optional |
| images | relation (files) | optional |
| availability | string/enum | optional |
| tags | m2m | optional |
| categories | m2m | optional |

## Publishing-Logik

Ein Produkt gilt als veröffentlicht, wenn:

```
status === "published"
UND
(publish_date <= now ODER publish_date ist null)
```

Die Website filtert serverseitig ausschließlich veröffentlichte Produkte.

Optional: Preview-Modus für Admins.

---

# 🖥 Rendering-Strategie

## Produktübersicht

- SEO-freundlich (HTML enthält Produktdaten)
- SSR oder ISR
- Revalidate konfigurierbar

Beispiel ISR:

```ts
export const revalidate = 60;
```

## Produktdetailseite

Route:

```
/products/[slug]
```

- Serverseitige Datenabfrage
- 404 bei ungültigem Slug
- Fehlerzustände sauber gerendert

---

# 🔍 Features

---

## 🛒 Produktübersicht

- Automatische Produktliste beim Seitenaufruf
- Anzeige:
  - Name
  - Preis
  - Vorschaubild
- Leerer Zustand bei 0 Produkten
- Lade- und Fehlerzustände sichtbar
- Keine hardcodierten Produkte

---

## 🧾 Produktdetailseite

Zeigt:

- Name
- Beschreibung
- Preis
- Verfügbarkeit (falls vorhanden)
- Mindestens 1 Produktbild (Fallback falls keines existiert)

Ungültige Slugs liefern 404.

---

## 🏷 Filter (Kategorien & Tags)

- Filteroptionen aus Directus
- Mehrfachauswahl möglich
- Aktive Filter sichtbar
- Einzelnes Entfernen möglich
- "Alle zurücksetzen"-Funktion
- Query-Parameter werden korrekt an REST API übergeben

Beispiel:

```
/products?category=shirts&tags=sale,new
```

---

## 🔎 Suche

- Suchfeld in Produktübersicht
- Suche nach:
  - Name
  - optional SKU
- API-basierte Suche
- "Keine Treffer"-Zustand
- Suchbegriff löschbar

---

## 🖼 Medienverwaltung

- Bilder-Upload in Directus
- Zuordnung zu Produkten
- Mehrere Bilder möglich
- Galerie/Slider unterstützbar
- Responsive Images
- Placeholder bei fehlenden Bildern
- Optional: Alt-Texte im Frontend nutzbar

---

# 🔐 Sicherheit & Publishing-Regeln

- API-URL und Tokens über Environment Variablen
- Keine Secrets im Frontend
- Serverseitige Filterung auf veröffentlichte Produkte
- Entwürfe:
  - Nicht in Listen sichtbar
  - Nicht über Direkt-URL erreichbar
- API liefert nur berechtigte Daten

---

# 🌍 Environment Variablen

```
DIRECTUS_URL=
DIRECTUS_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

Unterstützt:

- Development
- Staging
- Production

---

# 🧪 Testbarkeit

- Fetch mockbar
- API-Client isoliert testbar
- UI unabhängig vom CMS-Response-Format
- Fehlerobjekte standardisiert
- Keine CMS-Logik in Komponenten

---

# 🚀 Deployment

- Konfiguration über `.env` Dateien
- ISR Revalidate-Zeiten pro Umgebung definierbar
- Server-seitige Requests für Secret-Nutzung

---

# 📌 Erweiterungsmöglichkeiten

- Preview Mode
- Pagination
- GraphQL statt REST
- Internationalisierung (i18n)
- Caching Layer
- Warenkorb / Checkout Integration
- Role-based Access für Preview

---

# 📄 Lizenz

Projektintern definieren.




