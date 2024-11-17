import type { Coordinator } from "@vim-fall/core/coordinator";
import type { Theme } from "@vim-fall/core/theme";

import { type Derivable, derive } from "./derivable.ts";

/**
 * Setting.
 */
export type Setting = {
  coordinator: Coordinator;
  theme: Theme;
};

/**
 * Refines the setting, allowing customization of global coordinator and theme.
 */
export type RefineSetting = (
  params: Readonly<{
    coordinator?: Derivable<Coordinator>;
    theme?: Derivable<Theme>;
  }>,
) => void;

/**
 * Builds a function that refines the setting based on the provided parameters.
 *
 * @param setting The setting to refine.
 * @returns The function that refines the setting.
 */
export function buildRefineSetting(
  setting: Setting,
): RefineSetting {
  return (params) => {
    if (params.theme) {
      setting.theme = derive(params.theme);
    }
    if (params.coordinator) {
      setting.coordinator = derive(params.coordinator);
    }
  };
}
