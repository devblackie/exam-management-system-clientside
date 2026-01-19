// clientside/src/config/streamingUtils.ts

interface StreamPayload {
  percent: number;
  message: string;
  file?: string;  // Base64 string
  error?: string;
}

export async function startStreamingDownload<T>(
  url: string,
  data: T,
  onProgress: (percent: number, message: string) => void,
  defaultFilename: string
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const response = await fetch(`${apiUrl}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) throw new Error("Server connection failed");
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const fullMessage = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 2);

      if (fullMessage.startsWith("data: ")) {
        try {
          const jsonString = fullMessage.replace("data: ", "").trim();
          const payload: StreamPayload = JSON.parse(jsonString);

          if (payload.error) throw new Error(payload.error);
          
          onProgress(payload.percent, payload.message);

          if (payload.file) {
            const byteCharacters = atob(payload.file);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/zip' });
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = defaultFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
          }
        } catch (e) {
          console.error("Parse error in stream", e);
        }
      }
      boundary = buffer.indexOf("\n\n");
    }
  }
}