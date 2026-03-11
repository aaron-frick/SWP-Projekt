import test from "node:test";
import assert from "node:assert/strict";
import { createDirectusClient, serializeQuery } from "./client.js";
import { createProductsApi } from "./products.js";

function createJsonResponse({ ok = true, status = 200, body = {} } = {}) {
  return {
    ok,
    status,
    headers: {
      get(name) {
        if (name.toLowerCase() === "content-type") {
          return "application/json";
        }
        return null;
      },
    },
    async json() {
      return body;
    },
    async text() {
      return JSON.stringify(body);
    },
  };
}

test("serializeQuery supports Directus filter syntax", () => {
  const result = serializeQuery({
    limit: 10,
    filter: {
      status: { _eq: "published" },
      price: { _lte: 99 },
    },
    fields: ["id", "name"],
  });

  assert.equal(
    result,
    "limit=10&filter%5Bstatus%5D%5B_eq%5D=published&filter%5Bprice%5D%5B_lte%5D=99&fields=id%2Cname"
  );
});

test("products list uses /items/Products and unwraps data array", async () => {
  let capturedUrl = "";
  let capturedInit = null;

  const fetchFn = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;

    return createJsonResponse({
      body: {
        data: [{ id: 1, title: "Coffee" }],
        meta: { filter_count: 1 },
      },
    });
  };

  const client = createDirectusClient({
    baseUrl: "http://10.115.3.12:8055",
    token: "token-123",
    fetchFn,
  });

  const productsApi = createProductsApi(client);
  const result = await productsApi.listProducts({
    limit: 1,
    filter: { status: { _eq: "published" } },
  });

  assert.equal(result.ok, true);
  assert.equal(Array.isArray(result.data), true);
  assert.equal(result.data.length, 1);
  assert.equal(
    capturedUrl,
    "http://10.115.3.12:8055/items/Products?filter%5Bstatus%5D%5B_eq%5D=published&limit=1"
  );
  assert.equal(capturedInit.method, "GET");
  assert.equal(capturedInit.headers.Authorization, "Bearer token-123");
});

test("returns consistent api error for Directus error payload", async () => {
  const fetchFn = async () =>
    createJsonResponse({
      ok: false,
      status: 400,
      body: {
        errors: [
          {
            message: "Invalid query",
            extensions: { code: "FAILED_VALIDATION" },
          },
        ],
      },
    });

  const client = createDirectusClient({
    baseUrl: "http://10.115.3.12:8055",
    fetchFn,
  });
  const productsApi = createProductsApi(client);

  const result = await productsApi.queryProducts({
    filter: { id: { _eq: null } },
  });

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "api");
  assert.equal(result.error.code, "FAILED_VALIDATION");
  assert.equal(result.error.status, 400);
});

test("is testable by mocking fetch and returns network errors", async () => {
  const fetchFn = async () => {
    throw new Error("ECONNREFUSED");
  };

  const client = createDirectusClient({
    baseUrl: "http://10.115.3.12:8055",
    fetchFn,
  });
  const productsApi = createProductsApi(client);

  const result = await productsApi.listProducts();

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "network");
  assert.equal(result.error.message, "ECONNREFUSED");
});

test("returns config error when base URL is missing", async () => {
  const client = createDirectusClient({
    fetchFn: async () => createJsonResponse({ body: { data: [] } }),
  });

  const result = await client.get("/items/Products");

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "config");
});

test("search by name sends _icontains filter on name field", async () => {
  let capturedUrl = "";

  const fetchFn = async (url) => {
    capturedUrl = url;
    return createJsonResponse({ body: { data: [{ id: 1, name: "Vitamin C" }] } });
  };

  const client = createDirectusClient({ baseUrl: "http://10.115.3.12:8055", fetchFn });
  const productsApi = createProductsApi(client);

  const result = await productsApi.listProducts({
    filter: { _or: [{ name: { _icontains: "vitamin" } }, { sku: { _icontains: "vitamin" } }] },
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 1);
  // Directus expects indexed array items: filter[_or][0][name][_icontains]=vitamin
  assert.ok(
    capturedUrl.includes("_icontains%5D=vitamin"),
    "URL should contain percent-encoded _icontains operator with the search term"
  );
  assert.ok(
    capturedUrl.includes("_or%5D%5B0%5D"),
    "URL should use indexed _or array syntax"
  );
});

test("search by SKU sends _icontains filter on sku field", async () => {
  let capturedUrl = "";

  const fetchFn = async (url) => {
    capturedUrl = url;
    return createJsonResponse({ body: { data: [{ id: 2, name: "Omega 3", sku: "OMG-001" }] } });
  };

  const client = createDirectusClient({ baseUrl: "http://10.115.3.12:8055", fetchFn });
  const productsApi = createProductsApi(client);

  const result = await productsApi.listProducts({
    filter: { _or: [{ name: { _icontains: "OMG-001" } }, { sku: { _icontains: "OMG-001" } }] },
  });

  assert.equal(result.ok, true);
  // _or[1] corresponds to the sku filter entry
  assert.ok(
    capturedUrl.includes("_or%5D%5B1%5D%5Bsku%5D"),
    "URL should include sku in the second _or entry"
  );
});

test("search with no results returns empty array", async () => {
  const fetchFn = async () =>
    createJsonResponse({ body: { data: [] } });

  const client = createDirectusClient({ baseUrl: "http://10.115.3.12:8055", fetchFn });
  const productsApi = createProductsApi(client);

  const result = await productsApi.listProducts({
    filter: { _or: [{ name: { _icontains: "xyznotfound" } }, { sku: { _icontains: "xyznotfound" } }] },
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.length, 0);
});

test("search with special characters does not throw", async () => {
  let capturedUrl = "";

  const fetchFn = async (url) => {
    capturedUrl = url;
    return createJsonResponse({ body: { data: [] } });
  };

  const client = createDirectusClient({ baseUrl: "http://10.115.3.12:8055", fetchFn });
  const productsApi = createProductsApi(client);

  const specialChars = "café & 100% <test>";
  const result = await productsApi.listProducts({
    filter: { _or: [{ name: { _icontains: specialChars } }, { sku: { _icontains: specialChars } }] },
  });

  assert.equal(result.ok, true);
  assert.ok(capturedUrl.length > 0, "URL should be built without throwing");
});

test("graphql method exists and uses /graphql endpoint", async () => {
  let capturedUrl = "";

  const fetchFn = async (url) => {
    capturedUrl = url;
    return createJsonResponse({ body: { data: { products: [] } } });
  };

  const client = createDirectusClient({
    baseUrl: "http://10.115.3.12:8055",
    fetchFn,
  });

  const result = await client.graphql({ query: "{ products { id } }" });

  assert.equal(result.ok, true);
  assert.equal(capturedUrl, "http://10.115.3.12:8055/graphql");
});
