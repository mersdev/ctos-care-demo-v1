import { CTOSCoreService } from "./ctos-core";

export * from "./types";
export * from "./financial";
export { CTOSCoreService } from "./ctos-core";

// Export singleton instance
export const ctosService = CTOSCoreService.getInstance();
