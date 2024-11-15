import type { Denops } from "@denops/std";
import type {
  DefineItemPickerFromCurator,
  DefineItemPickerFromSource,
} from "./item_picker_params.ts";
import type { RefineActionPicker } from "./action_picker_params.ts";
import type { RefineGlobalConfig } from "./global_config.ts";

/**
 * The entrypoint for configuring the picker environment.
 *
 * @param params - An object containing various picker setup functions and the Denops instance.
 */
export type Entrypoint = (params: {
  denops: Denops;
  defineItemPickerFromSource: DefineItemPickerFromSource;
  defineItemPickerFromCurator: DefineItemPickerFromCurator;
  refineActionPicker: RefineActionPicker;
  refineGlobalConfig: RefineGlobalConfig;
}) => void | Promise<void>;

export type {
  DefineItemPickerFromCurator,
  DefineItemPickerFromSource,
} from "./item_picker_params.ts";
export type { RefineActionPicker } from "./action_picker_params.ts";
export type { RefineGlobalConfig } from "./global_config.ts";
