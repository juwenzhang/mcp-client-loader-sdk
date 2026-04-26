export type HttpHeaders = Record<string, string>;

export class HttpClient {
  constructor(
    public url: string,
    public headers: HttpHeaders = {},
    public timeout = 30000
  ) {}

  async send(
    payload: unknown,
    onChunk?: (line: string) => void
  ): Promise<string> {
    if (typeof fetch !== 'function') {
      throw new Error('Global fetch is not available in this runtime.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          ...this.headers,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${bodyText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder("utf-8");
      let fullRaw = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullRaw += chunk;

        const lines = chunk.split("\n").filter(line => line.trim());
        for (const line of lines) {
          onChunk?.(line);
        }
      }

      return fullRaw;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('HttpClient timeout');
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}