export function createTermsApi(http) {
  return {
    list(query, options) {
      return http.get("/api/v1/terms", { ...options, query });
    },

    get(id, options) {
      return http.get(`/api/v1/terms/${encodeURIComponent(id)}`, options);
    },
  };
}
