chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveAsWebP",
    title: "Save image as WebP",
    contexts: ["image"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "saveAsWebP") {
    convertAndDownload(info.srcUrl, info.pageUrl);
  }
});

async function convertAndDownload(srcUrl, pageUrl) {
  const response = await fetch(srcUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext("2d").drawImage(bitmap, 0, 0);

  const webpBlob = await canvas.convertToBlob({ type: "image/webp", quality: 0.75 });
  const dataUrl = await blobToDataUrl(webpBlob);

  const filename = deriveName(srcUrl, pageUrl) + ".webp";
  chrome.downloads.download({ url: dataUrl, filename });
}

function deriveName(srcUrl, pageUrl) {
  // Use Google search query when on a Google Images page
  if (pageUrl) {
    const page = new URL(pageUrl);
    if (page.hostname.includes("google.") && page.searchParams.has("q")) {
      return page.searchParams.get("q").replace(/\s+/g, "_");
    }
  }
  // Fall back to the image filename without extension
  return new URL(srcUrl).pathname.split("/").pop().replace(/\.[^.]+$/, "") || "image";
}

async function blobToDataUrl(blob) {
  const ab = await blob.arrayBuffer();
  const bytes = new Uint8Array(ab);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/webp;base64,${btoa(binary)}`;
}
