(function () {
  if (window.__ipmpShowcaseBridge) return;
  window.__ipmpShowcaseBridge = true;

  var lastAt = 0;

  function findVideo() {
    return (
      window.ps ||
      window.pixelStreamRef ||
      document.querySelector('video[is="peer-stream"]') ||
      document.querySelector("video.pixelStream")
    );
  }

  function findShowcaseBtn(target) {
    if (!target) return null;
    if (target.nodeType === 3) target = target.parentNode;
    if (!target || !target.closest) return null;
    return (
      target.closest(".tree-showcase-btn") ||
      target.closest("[data-showcase]")
    );
  }

  function sendShowCase(id) {
    var now = Date.now();
    if (lastAt && now - lastAt < 400) return;
    lastAt = now;
    var msg = { event: "ShowCase", data: id == null ? "" : String(id) };
    console.log("[pixelStream] send", JSON.stringify(msg));
    var el = findVideo();
    if (!el || typeof el.emitMessage !== "function") {
      console.warn("[pixelStream] 像素流 video 未就绪，无法发送 ShowCase", el);
      return;
    }
    try {
      el.emitMessage(msg);
    } catch (err) {
      console.warn("[pixelStream] ShowCase 发送失败", err);
    }
    try {
      window.dispatchEvent(
        new CustomEvent("ipmp-showcase", { detail: msg.data })
      );
    } catch (e) {}
  }

  function onPointer(e) {
    var btn = findShowcaseBtn(e.target);
    if (!btn) return;
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    var id = (btn.getAttribute("data-showcase") || "").replace(/^\s+|\s+$/g, "");
    sendShowCase(id);
  }

  document.addEventListener("click", onPointer, true);
  document.addEventListener("mousedown", onPointer, true);
  window.sendShowCase = sendShowCase;
})();
