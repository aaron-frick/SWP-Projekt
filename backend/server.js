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
      return String(entry.directus_files_id);
    }

    if (entry.file?.id) {
      return String(entry.file.id);
    }
  }

  return null;
}

function extractImageUrls(item) {
  const candidates = [item?.images, item?.image, item?.gallery].filter(Boolean);
  const assetIds = [];

  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => {
        const id = extractAssetId(entry);
        if (id) {
          assetIds.push(id);
        }
      });
      return;
    }

    const id = extractAssetId(candidate);
    if (id) {
      assetIds.push(id);
    }
  });

  return assetIds
    .map((assetId) => buildAssetUrl(assetId))
    .filter(Boolean);
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
  const publishFilter = { status: { _eq: "published" } };
  if (!userFilter) return publishFilter;
  return { _and: [publishFilter, userFilter] };
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

  const result = await productsApi.listProducts({
    filter: mergePublishFilter(filter),
    fields: parseCsv(req.query.fields),
    sort: parseCsv(req.query.sort),
    limit: parseNumber(req.query.limit),
    page: parseNumber(req.query.page),
    search: typeof req.query.search === "string" ? req.query.search : undefined,
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

  const result = await productsApi.queryProducts({
    filter: mergePublishFilter({ slug: { _eq: slug } }),
    limit: 1,
  });

  if (!result.ok) {
    sendError(res, result.error);
    return;
  }

  const item = result.data[0];
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
