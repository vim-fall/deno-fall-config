import type { Action } from "@vim-fall/core/action";
import type { Coordinator } from "@vim-fall/core/coordinator";
import type { Detail } from "@vim-fall/core/item";
import type { Matcher } from "@vim-fall/core/matcher";
import type { Previewer } from "@vim-fall/core/previewer";
import type { Renderer } from "@vim-fall/core/renderer";
import type { Sorter } from "@vim-fall/core/sorter";
import type { Theme } from "@vim-fall/core/theme";

import {
  type Derivable,
  type DerivableArray,
  derive,
  deriveArray,
} from "./derivable.ts";

/**
 * Parameters required to configure an action picker.
 */
export type ActionPickerParams = {
  matchers: readonly [Matcher<Action<Detail>>, ...Matcher<Action<Detail>>[]];
  sorters?: readonly Sorter<Action<Detail>>[];
  renderers?: readonly Renderer<Action<Detail>>[];
  previewers?: readonly Previewer<Action<Detail>>[];
  coordinator?: Coordinator;
  theme?: Theme;
};

/**
 * Refines the configuration for an action picker.
 */
export type RefineActionPicker = (
  params: Readonly<{
    matchers: DerivableArray<
      readonly [Matcher<Action<Detail>>, ...Matcher<Action<Detail>>[]]
    >;
    sorters?: DerivableArray<readonly Sorter<Action<Detail>>[]>;
    renderers?: DerivableArray<readonly Renderer<Action<Detail>>[]>;
    previewers?: DerivableArray<readonly Previewer<Action<Detail>>[]>;
    coordinator?: Derivable<Coordinator>;
    theme?: Derivable<Theme>;
  }>,
) => void;

/**
 * Builds a function that refines the configuration for an action picker using the provided parameters.
 *
 * @param actionPickerParams The parameters to configure the action picker.
 * @returns The function that refines the configuration for an action picker.
 */
export function buildRefineActionPicker(
  actionPickerParams: ActionPickerParams,
): RefineActionPicker {
  return (params) => {
    if (params.matchers) {
      actionPickerParams.matchers = deriveArray(params.matchers);
    }
    if (params.sorters) {
      actionPickerParams.sorters = deriveArray(params.sorters);
    }
    if (params.renderers) {
      actionPickerParams.renderers = deriveArray(params.renderers);
    }
    if (params.previewers) {
      actionPickerParams.previewers = deriveArray(params.previewers);
    }
    if (params.coordinator) {
      actionPickerParams.coordinator = derive(params.coordinator);
    }
    if (params.theme) {
      actionPickerParams.theme = derive(params.theme);
    }
  };
}
