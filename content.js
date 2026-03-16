chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "convertAndSave") return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);

    const dataUrl = canvas.toDataURL("image/webp");
    const srcName = msg.srcUrl.split("/").pop().split("?")[0].replace(/\.[^.]+$/, "");
    const filename = (srcName || "image") + ".webp";

    chrome.runtime.sendMessage({ action: "downloadWebP", dataUrl, filename });
  };
  img.onerror = () => alert("Save as WebP: could not load image (CORS or other error).");
  img.src = msg.srcUrl;
});
