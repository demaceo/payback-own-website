import QRCode from "qrcode";
import { DOWNLOAD_PATH, SITE_URL } from "@/lib/site";

/**
 * Build-time QR code pointing at the /download smart link, which forwards each
 * device to its store. Rendered on the server, so no QR library ships to the browser.
 */
export async function QrCode() {
  const target = `${SITE_URL}${DOWNLOAD_PATH}`;
  const svg = await QRCode.toString(target, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#05060E", light: "#FFFFFF" },
  });

  return (
    <div className="qr">
      <div
        className="box"
        role="img"
        aria-label="QR code. Scan to download Payback."
        // Generated locally from a trusted, build-time URL.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span>Scan to Download</span>
    </div>
  );
}
