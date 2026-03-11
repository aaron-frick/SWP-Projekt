function sanitizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
    return null;
  }

  return baseUrl.trim().replace(/\/+$/, "");
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function appendQueryParam(searchParams, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return;
    }

    // Arrays of objects must be indexed (e.g. filter[_or][0][name][_icontains]=x)
    // so Directus can parse them correctly. Primitive arrays (fields, sort) are
    // joined as comma-separated strings.
    const hasObjects = value.some(isPlainObject);
    if (hasObjects) {
      value.forEach((item, index) => {
        appendQueryParam(searchParams, `${key}[${index}]`, item);
      });
    } else {
      searchParams.append(key, value.join(","));
    }
    return;
  }

  if (isPlainObject(value)) {
    for (const [nestedKey, nestedValue] of Object.entries(value)) {
      appendQueryParam(searchParams, `${key}[${nestedKey}]`, nestedValue);
    }
    return;
  }

  searchParams.append(key, String(value));
}

export function serializeQuery(query = {}) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryParam(searchParams, key, value);
  }

  return searchParams.toString();
}

function createApiError({
  type,
  message,
  status = null,
  code = null,
  details = null,
  retryable = false,
}) {
  return {
    type,
    message,
    status,
    code,
    details,
    retryable,
  };
}

function createFailureResult(error) {
  return {
    ok: false,
    data: null,
    meta: null,
    error,
  };
}

async function resolveToken(tokenOrProvider) {
  if (!tokenOrProvider) {
    return null;
  }

  if (typeof tokenOrProvider === "function") {
    return tokenOrProvider();
  }

  return tokenOrProvider;
}

function buildUrl(baseUrl, path, query) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const queryString = serializeQuery(query);

  if (!queryString) {
    return `${baseUrl}${normalizedPath}`;
  }

  return `${baseUrl}${normalizedPath}?${queryString}`;
}

async function parseResponse(response) {
  const contentType = response.headers?.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    return response.json();
  }

  const text = await response.text();
  return text ? { raw: text } : {};
}

function mapDirectusError(payload, status) {
  const directusError =
    payload?.errors?.[0] || payload?.error || payload?.errors || payload;

  return createApiError({
    type: "api",
    message:
      directusError?.message ||
      `Directus API request failed with status ${status}.`,
    status,
    code: directusError?.extensions?.code || directusError?.code || null,
    details: directusError,
    retryable: status >= 500,
  });
}

function mapHttpError(status, payload) {
  return createApiError({
    type: "http",
    message: `HTTP request failed with status ${status}.`,
    status,
    details: payload || null,
    retryable: status >= 500,
  });
}

function unwrapData(payload) {
  if (isPlainObject(payload) && "data" in payload) {
    return { data: payload.data, meta: payload.meta || null };
  }

  return { data: payload, meta: null };
}

export function createDirectusClient({ baseUrl, token = null, fetchFn = fetch } = {}) {
  const normalizedBaseUrl = sanitizeBaseUrl(baseUrl);

  async function request(path, { method = "GET", query, body, headers = {}, signal } = {}) {
    if (!normalizedBaseUrl) {
      return createFailureResult(
        createApiError({
          type: "config",
          message: "Directus baseUrl is missing or invalid.",
        })
      );
    }

    const requestHeaders = {
      Accept: "application/json",
      ...headers,
    };

    if (body !== undefined && body !== null && !(body instanceof FormData)) {
      requestHeaders["Content-Type"] = "application/json";
    }

    const resolvedToken = await resolveToken(token);
    if (resolvedToken) {
      requestHeaders.Authorization = `Bearer ${resolvedToken}`;
    }

    const url = buildUrl(normalizedBaseUrl, path, query);

    let response;
    try {
      response = await fetchFn(url, {
        method,
        headers: requestHeaders,
        body:
          body === undefined || body === null || body instanceof FormData
            ? body
            : JSON.stringify(body),
        signal,
      });
    } catch (error) {
      return createFailureResult(
        createApiError({
          type: "network",
          message: error?.message || "Network request failed.",
          details: error,
          retryable: true,
        })
      );
    }

    let payload;
    try {
      payload = await parseResponse(response);
    } catch (error) {
      return createFailureResult(
        createApiError({
          type: "parse",
          message: "Unable to parse API response.",
          status: response.status,
          details: error,
        })
      );
    }

    if (!response.ok) {
      const hasDirectusError = Boolean(payload?.errors || payload?.error);
      return createFailureResult(
        hasDirectusError
          ? mapDirectusError(payload, response.status)
          : mapHttpError(response.status, payload)
      );
    }

    const { data, meta } = unwrapData(payload);
    return {
      ok: true,
      data,
      meta,
      error: null,
    };
  }

  async function graphql({ query, variables, operationName, signal }) {
    return request("/graphql", {
      method: "POST",
      body: {
        query,
        variables,
        operationName,
      },
      signal,
    });
  }

  return {
    request,
    get: (path, options = {}) => request(path, { ...options, method: "GET" }),
    post: (path, body, options = {}) =>
      request(path, { ...options, method: "POST", body }),
    patch: (path, body, options = {}) =>
      request(path, { ...options, method: "PATCH", body }),
    delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
    graphql,
  };
}
