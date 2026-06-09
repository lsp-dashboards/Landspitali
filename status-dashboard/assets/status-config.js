// Production status console configuration.
// The endpoint should be the deployed Apps Script Web App URL for tracker/powerbi_router_tracker_apps_script_v1.js.
window.LSP_STATUS_CONFIG = {
  dataEndpoint: "https://script.google.com/macros/s/AKfycbxRoNEQwlxQUpxEMGzYizAB0_lP1MdqksGLu4fD7c94rzqUul3MW2_E9VCqeRzLK3wD/exec",
  api: "dashboard",
  format: "js",
  callbackParam: "callback",
  requestTimeoutMs: 30000,
  refreshMinutes: 5,
  allowSampleDataFallback: true,
  allowedImageHosts: ["images.ctfassets.net"]
};
