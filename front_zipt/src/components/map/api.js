export function createMapApi(http) {
  return {
    getInfraMarkers(query, options) {
      return http.get("/api/v1/map/infra", { ...options, query });
    },

    getPropertyMarkers(query, options) {
      return http.get("/api/v1/map/properties", { ...options, query });
    },
  };
}
