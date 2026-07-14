function installPromiseWithResolversPolyfill() {
  if (typeof Promise.withResolvers === "function") return;
  Object.defineProperty(Promise, "withResolvers", {
    configurable: true,
    writable: true,
    value() {
      let resolve;
      let reject;
      const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
      });
      return { promise, resolve, reject };
    }
  });
}

installPromiseWithResolversPolyfill();
globalThis.ExamCramPdfVendorReady = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
  const vendor = Object.freeze({ pdfjs });
  globalThis.ExamCramPdfVendor = vendor;
  return vendor;
});
