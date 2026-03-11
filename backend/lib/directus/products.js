function toCommaSeparated(value) {
  if (Array.isArray(value)) {
    return value.join(",");
  }

  return value;
}

function createValidationError(message, details = null) {
  return {
    ok: false,
    data: null,
    meta: null,
    error: {
      type: "validation",
      message,
      status: null,
      code: null,
      details,
      retryable: false,
    },
  };
}

function buildProductsQuery({ filter, fields, limit, page, search, sort } = {}) {
  const query = {};

  if (filter) {
    query.filter = filter;
  }

  if (fields) {
    query.fields = toCommaSeparated(fields);
  }

  if (sort) {
    query.sort = toCommaSeparated(sort);
  }

  if (typeof limit === "number") {
    query.limit = limit;
  }

  if (typeof page === "number") {
    query.page = page;
  }

  if (search) {
    query.search = search;
  }

  return query;
}

export function createProductsApi(client, { collection = "Products" } = {}) {
  const collectionPath = `/items/${encodeURIComponent(collection)}`;

  async function listProducts(options = {}) {
    const { signal, ...queryOptions } = options;
    const query = buildProductsQuery(queryOptions);

    const result = await client.get(collectionPath, { query, signal });
    if (!result.ok) {
      return result;
    }

    const products = Array.isArray(result.data) ? result.data : [];
    return {
      ok: true,
      data: products,
      meta: result.meta || null,
      error: null,
    };
  }

  async function getProductDetail(productId, options = {}) {
    if (productId === undefined || productId === null || productId === "") {
      return createValidationError("A valid productId is required.", { productId });
    }

    const { signal, fields } = options;
    const resolvedFields = fields || "*, products_images.directus_files_id.*";
    const query = { fields: toCommaSeparated(resolvedFields) };

    return client.get(`${collectionPath}/${encodeURIComponent(productId)}`, {
      query,
      signal,
    });
  }

  async function queryProducts(options = {}) {
    return listProducts(options);
  }

  return {
    listProducts,
    getProductDetail,
    queryProducts,
  };
}
