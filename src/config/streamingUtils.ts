// // clientside/src/config/streamingUtils.ts

// interface StreamPayload {
//   percent: number;
//   message: string;
//   file?: string;  // Base64 string
//   error?: string;
// }

// export async function startStreamingDownload<T>(
//   url: string,
//   data: T,
//   onProgress: (percent: number, message: string) => void,
//   defaultFilename: string
// ): Promise<void> {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
//   const response = await fetch(`${apiUrl}${url}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//     credentials: "include",
//   });

//   if (!response.ok) throw new Error("Server connection failed");
//   if (!response.body) throw new Error("No response body");

//   const reader = response.body.getReader();
//   const decoder = new TextDecoder();
//   let buffer = "";

//   while (true) {
//     const { value, done } = await reader.read();
//     if (done) break;

//     buffer += decoder.decode(value, { stream: true });
//     let boundary = buffer.indexOf("\n\n");

//     while (boundary !== -1) {
//       const fullMessage = buffer.substring(0, boundary).trim();
//       buffer = buffer.substring(boundary + 2);

//       if (fullMessage.startsWith("data: ")) {
//         try {
//           const jsonString = fullMessage.replace("data: ", "").trim();
//           const payload: StreamPayload = JSON.parse(jsonString);

//           if (payload.error) throw new Error(payload.error);
          
//           onProgress(payload.percent, payload.message);

//           if (payload.file) {
//             const byteCharacters = atob(payload.file);
//             const byteNumbers = new Array(byteCharacters.length);
//             for (let i = 0; i < byteCharacters.length; i++) {
//               byteNumbers[i] = byteCharacters.charCodeAt(i);
//             }
//             const byteArray = new Uint8Array(byteNumbers);
//             const blob = new Blob([byteArray], { type: 'application/zip' });
            
//             const downloadUrl = window.URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = downloadUrl;
//             a.download = defaultFilename;
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//             window.URL.revokeObjectURL(downloadUrl);
//           }
//         } catch (e) {
//           console.error("Parse error in stream", e);
//         }
//       }
//       boundary = buffer.indexOf("\n\n");
//     }
//   }
// }








// clientside/src/config/streamingUtils.ts — COMPLETE

interface StreamPayload {
  percent: number;
  message: string;
  file?:   string;   // Base64
  error?:  string;
}

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const row = document.cookie.split("; ").find(r => r.startsWith("csrfToken="));
  return row ? decodeURIComponent(row.split("=")[1]) : "";
}

// Map file extensions to correct MIME types so the browser opens them correctly
function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    zip:  "application/zip",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls:  "application/vnd.ms-excel",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf:  "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

export async function startStreamingDownload<T>(
  path:            string,
  data:            T,
  onProgress:      (percent: number, message: string) => void,
  defaultFilename: string,
): Promise<void> {
  // Build full URL — NEXT_PUBLIC_API_URL already has /api suffix in your setup
  const base    = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
  const fullUrl = `${base}${path}`;

  // ── KEY FIX: attach CSRF token ─────────────────────────────────────────────
  const csrfToken = getCsrfToken();

  const response = await fetch(fullUrl, {
    method:      "POST",
    credentials: "include",   // send session cookie
    headers: {
      "Content-Type":  "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Try to extract a JSON error message from the response body
    let msg = `Server error ${response.status}`;
    try {
      const ct   = response.headers.get("content-type") ?? "";
      const text = await response.text();
      if (ct.includes("application/json")) {
        const json = JSON.parse(text) as { message?: string };
        msg = json.message ?? msg;
      } else {
        msg = text.slice(0, 200) || msg;
      }
    } catch { /* ignore parse errors */ }
    throw new Error(msg);
  }

  if (!response.body) throw new Error("No response body from server");

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process all complete SSE messages (separated by \n\n)
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const chunk = buffer.substring(0, boundary).trim();
      buffer      = buffer.substring(boundary + 2);

      if (chunk.startsWith("data: ")) {
        const jsonStr = chunk.slice(6).trim();
        if (!jsonStr) { boundary = buffer.indexOf("\n\n"); continue; }

        try {
          const payload: StreamPayload = JSON.parse(jsonStr);

          if (payload.error) throw new Error(payload.error);

          if (typeof payload.percent === "number" && payload.message) {
            onProgress(payload.percent, payload.message);
          }

          if (payload.file) {
            // Decode base64 → Uint8Array → Blob → download
            const binary = atob(payload.file);
            const bytes  = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }

            const mimeType    = getMimeType(defaultFilename);
            const blob        = new Blob([bytes], { type: mimeType });
            const downloadUrl = URL.createObjectURL(blob);
            const a           = document.createElement("a");
            a.href            = downloadUrl;
            a.download        = defaultFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);
          }
        } catch (e) {
          // Re-throw real errors; silently skip JSON parse glitches
          if (e instanceof SyntaxError) {
            console.warn("[streamingUtils] Partial JSON chunk — skipping");
          } else {
            throw e;
          }
        }
      }

      boundary = buffer.indexOf("\n\n");
    }
  }
}