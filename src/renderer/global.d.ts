export {};

declare global {
  interface Window {
    electronAPI?: {
      createPlotWindow?: (config: Record<string, unknown>) => Promise<{ windowId: number }>;
      getWindowConfig?: () => Promise<{ openPlotWindows: string[] }>;
    };
  }
}
