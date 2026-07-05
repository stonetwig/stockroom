if (typeof window === "undefined" || typeof HTMLElement === "undefined") {
  await import("../server/main.js");
} else {
  await import("./browser-app.js");
}
