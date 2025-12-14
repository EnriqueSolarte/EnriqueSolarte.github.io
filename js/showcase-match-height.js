(() => {
  const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

  function parsePx(value) {
    const numberValue = Number.parseFloat(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }

  function scheduleRaf(callback) {
    let rafId = 0;
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        callback();
      });
    };
  }

  function syncShowcaseImageHeight(section) {
    const leftInner = section.querySelector(".showcase-left-inner");
    const img = section.querySelector(".profile-image img.project");
    if (!leftInner || !img) return;

    const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
    if (!isDesktop) {
      img.style.removeProperty("width");
      img.style.removeProperty("height");
      return;
    }

    const leftHeight = leftInner.getBoundingClientRect().height;
    if (!Number.isFinite(leftHeight) || leftHeight <= 0) return;

    const aspectRatio =
      img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0;
    if (!Number.isFinite(aspectRatio) || aspectRatio <= 0) return;

    const profileCol = img.closest(".profile-image");
    const maxWidth = profileCol ? profileCol.getBoundingClientRect().width : 0;
    if (!Number.isFinite(maxWidth) || maxWidth <= 0) return;

    const imgStyles = window.getComputedStyle(img);
    const marginTop = parsePx(imgStyles.marginTop);
    const marginBottom = parsePx(imgStyles.marginBottom);
    const maxHeight = Math.max(0, leftHeight - marginTop - marginBottom);

    let targetHeight = maxHeight;
    let targetWidth = targetHeight * aspectRatio;

    if (targetWidth > maxWidth) {
      targetWidth = maxWidth;
      targetHeight = targetWidth / aspectRatio;
    }

    img.style.width = `${Math.round(targetWidth)}px`;
    img.style.height = `${Math.round(targetHeight)}px`;
  }

  function init() {
    const section =
      document.querySelector("#home.rad-showcase--index") ||
      document.querySelector(".rad-showcase--index");
    if (!section) return;

    const scheduledSync = scheduleRaf(() => syncShowcaseImageHeight(section));
    scheduledSync();

    window.addEventListener("resize", scheduledSync, { passive: true });

    const leftInner = section.querySelector(".showcase-left-inner");
    const img = section.querySelector(".profile-image img.project");
    if (leftInner && "ResizeObserver" in window) {
      const ro = new ResizeObserver(scheduledSync);
      ro.observe(leftInner);
      if (img) ro.observe(img);
    }

    if (img) {
      img.addEventListener("load", scheduledSync, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
