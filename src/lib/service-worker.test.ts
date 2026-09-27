import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

describe("PWA update behavior", () => {
  it("prefers the deployed network page over a stale cached page for navigation", async () => {
    const listeners = new Map<string, (event: unknown) => void>();
    const cached = new Response("old formula library");
    const deployed = new Response("new family-organized library");
    const context = {
      self: {
        addEventListener: (name: string, listener: (event: unknown) => void) => listeners.set(name, listener),
      },
      caches: {
        match: vi.fn().mockResolvedValue(cached),
        open: vi.fn().mockResolvedValue({ put: vi.fn(), addAll: vi.fn() }),
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      },
      fetch: vi.fn().mockResolvedValue(deployed),
      Response,
      Promise,
    };
    runInNewContext(readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8"), context);

    let responsePromise: Promise<Response> | undefined;
    listeners.get("fetch")?.({
      request: { method: "GET", mode: "navigate", url: "https://example.test/" },
      respondWith: (promise: Promise<Response>) => { responsePromise = promise; },
    });

    expect(responsePromise).toBeDefined();
    await expect(responsePromise).resolves.toHaveProperty("body");
    await expect((await responsePromise!).text()).resolves.toBe("new family-organized library");
  });
});
