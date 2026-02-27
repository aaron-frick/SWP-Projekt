/**
 * Represents a product as returned by the backend API.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | null;
  availability: string | null;
  images: string[];
  status: string | null;
}

/**
 * API response wrapper for a list of products.
 */
export interface ProductListResponse {
  data: Product[];
  meta: Record<string, unknown> | null;
}

/**
 * API response wrapper for a single product.
 */
export interface ProductDetailResponse {
  data: Product;
}

/**
 * API error response.
 */
export interface ApiError {
  error: {
    type: string;
    message: string;
    status: number;
    code: string | null;
    details: Record<string, unknown> | null;
    retryable: boolean;
  };
}
