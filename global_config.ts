import type { Coordinator } from "@vim-fall/core/coordinator";
import type { Theme } from "@vim-fall/core/theme";

import { type Derivable, derive } from "./derivable.ts";

/**
 * Global configuration settings.
 */
export type GlobalConfig = {
  coordinator: Coordinator;
  theme: Theme;
};

/**
 * Refines the global configuration, allowing customization of global coordinator and theme.
 */
export type RefineGlobalConfig = (
  params: Readonly<{
    coordinator?: Derivable<Coordinator>;
    theme?: Derivable<Theme>;
  }>,
) => void;

/**
 * Builds a function that refines the global configuration based on the provided parameters.
 *
 * @param config The global configuration to refine.
 * @returns The function that refines the global configuration.
 */
export function buildRefineGlobalConfig(
  config: GlobalConfig,
): RefineGlobalConfig {
  return (params) => {
    if (params.theme) {
      config.theme = derive(params.theme);
    }
    if (params.coordinator) {
      config.coordinator = derive(params.coordinator);
    }
  };
}
