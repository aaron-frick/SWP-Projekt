import "dotenv/config";
import express from "express";
import { createDirectusClient } from "./lib/directus/client.js";
import { createProductsApi } from "./lib/directus/products.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const directusUrl = process.env.DIRECTUS_URL || "";
const directusToken = process.env.DIRECTUS_TOKEN || null;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CORS_ORIGIN || "*"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

const client = createDirectusClient({
  baseUrl: directusUrl,
  token: directusToken,
});
const productsApi = createProductsApi(client, { collection: "Products" });

function normalizePrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function buildAssetUrl(assetId) {
  if (!assetId) {
    return null;
  }

  if (typeof assetId === "string") {
    if (assetId.startsWith("http://") || assetId.startsWith("https://")) {
      return assetId;
    }
  }

  if (!directusUrl) {
    return null;
  }

  return `${directusUrl.replace(/\/+$/, "")}/assets/${assetId}`;
}

function extractAssetId(entry) {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string" || typeof entry === "number") {
    return String(entry);
  }

  if (typeof entry === "object") {
    if (typeof entry.id === "string" || typeof entry.id === "number") {
      return String(entry.id);
    }

    if (entry.directus_files_id) {
      const nested = entry.directus_files_id;
      if (typeof nested === "object" && nested?.id) {
        return String(nested.id);
      }
      return String(nested);
    }

    if (entry.file?.id) {
      return String(entry.file.id);
    }
  }

  return null;
}

function extractImageAlt(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  if (typeof entry.title === "string" && entry.title.trim()) {
    return entry.title.trim();
  }

  const nested = entry.directus_files_id;
  if (nested && typeof nested === "object") {
    if (typeof nested.title === "string" && nested.title.trim()) {
      return nested.title.trim();
    }
  }

  if (entry.file && typeof entry.file === "object") {
    if (typeof entry.file.title === "string" && entry.file.title.trim()) {
      return entry.file.title.trim();
    }
  }

  return null;
}

function extractImageUrls(item) {
  const candidates = [item?.images, item?.image, item?.gallery].filter(Boolean);
  const assets = [];

  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => {
        const id = extractAssetId(entry);
        if (id) {
          assets.push({ id, alt: extractImageAlt(entry) });
        }
      });
      return;
    }

    const id = extractAssetId(candidate);
    if (id) {
      assets.push({ id, alt: extractImageAlt(candidate) });
    }
  });

  return assets
    .map(({ id, alt }) => ({ url: buildAssetUrl(id), alt }))
    .filter((img) => img.url !== null);
}

function mapProduct(item) {
  const idValue = item?.id ?? item?.ID ?? item?.slug ?? "unknown";
  const id = String(idValue);
  const slug = item?.slug ? String(item.slug) : id;
  const name =
    item?.name || item?.title || item?.product_name || "Unbenanntes Produkt";
  const description =
    item?.description || item?.short_description || item?.summary || "";
  const price = normalizePrice(item?.price ?? item?.amount ?? item?.cost);
  const availability =
    item?.availability ?? item?.stock_status ?? item?.stock ?? null;
  const status = item?.status ?? null;

  return {
    id,
    slug,
    name: String(name),
    description: String(description),
    price,
    availability: availability ? String(availability) : null,
    images: extractImageUrls(item),
    status: status ? String(status) : null,
  };
}

function mergePublishFilter(userFilter) {
  // TODO: Aktivieren sobald das status-Feld in Directus eingerichtet ist (Sprint 3)
  // const publishFilter = { status: { _eq: "published" } };
  // if (!userFilter) return publishFilter;
  // return { _and: [publishFilter, userFilter] };
  return userFilter;
}

/**
 * Builds a case-insensitive Directus filter for name/SKU search.
 * Using _icontains instead of the global Directus `search` param makes
 * the search deterministic and independent of Directus field configuration.
 */
function buildSearchFilter(search) {
  if (!search || typeof search !== "string") return undefined;
  const term = search.trim();
  if (!term) return undefined;
  return { _or: [{ name: { _icontains: term } }, { sku: { _icontains: term } }] };
}

function mergeFilters(a, b) {
  if (!a && !b) return undefined;
  if (!a) return b;
  if (!b) return a;
  return { _and: [a, b] };
}

function mapErrorToStatus(error) {
  if (error?.type === "validation") {
    return 400;
  }

  if (error?.type === "not_found") {
    return 404;
  }

  if (error?.type === "config") {
    return 500;
  }

  if (error?.type === "network") {
    return 502;
  }

  if (typeof error?.status === "number") {
    return error.status;
  }

  return 502;
}

function parseCsv(value) {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function parseNumber(value) {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseFilter(filterValue) {
  if (!filterValue) {
    return undefined;
  }

  if (typeof filterValue === "object") {
    return filterValue;
  }

  if (typeof filterValue !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(filterValue);
  } catch (error) {
    return null;
  }
}

function sendError(res, error) {
  const status = mapErrorToStatus(error);
  res.status(status).json({
    error: {
      type: error?.type || "http",
      message: error?.message || "Request failed.",
      status,
      code: error?.code || null,
      details: error?.details || null,
      retryable: Boolean(error?.retryable),
    },
  });
}

app.get("/api/products", async (req, res) => {
  const filter = parseFilter(req.query.filter);

  if (filter === null) {
    res.status(400).json({
      error: {
        type: "validation",
        message: "Filter must be valid JSON.",
        status: 400,
        code: null,
        details: { filter: req.query.filter },
        retryable: false,
      },
    });
    return;
  }

  const searchTerm = typeof req.query.search === "string" ? req.query.search : undefined;
  const searchFilter = buildSearchFilter(searchTerm);
  const combinedFilter = mergeFilters(mergePublishFilter(filter), searchFilter);

  const result = await productsApi.listProducts({
    filter: combinedFilter,
    fields: parseCsv(req.query.fields),
    sort: parseCsv(req.query.sort),
    limit: parseNumber(req.query.limit),
    page: parseNumber(req.query.page),
  });

  if (!result.ok) {
    sendError(res, result.error);
    return;
  }

  res.json({
    data: result.data.map(mapProduct),
    meta: result.meta || null,
  });
});

app.get("/api/products/:slug", async (req, res) => {
  const slug = req.params.slug;

  // 1. Try direct primary-key lookup (works even when no slug field exists in Directus
  //    and the slug is actually the item id).
  const directResult = await productsApi.getProductDetail(slug);
  if (directResult.ok && directResult.data) {
    res.json({ data: mapProduct(directResult.data) });
    return;
  }

  // 2. Fall back to filtering by the slug field.
  const filterResult = await productsApi.queryProducts({
    filter: mergePublishFilter({ slug: { _eq: slug } }),
    limit: 1,
  });

  if (!filterResult.ok) {
    sendError(res, filterResult.error);
    return;
  }

  const item = filterResult.data[0];
  if (!item) {
    res.status(404).json({
      error: {
        type: "not_found",
        message: "Produkt nicht gefunden.",
        status: 404,
        code: null,
        details: { slug },
        retryable: false,
      },
    });
    return;
  }

  res.json({ data: mapProduct(item) });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
