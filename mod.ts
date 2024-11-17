import type { Denops } from "@denops/std";
import type {
  DefinePickerFromCurator,
  DefinePickerFromSource,
} from "./picker.ts";
import type { RefineActionPicker } from "./action_picker.ts";
import type { RefineSetting } from "./setting.ts";

/**
 * The entrypoint for configuring the picker environment.
 *
 * @param params - An object containing various picker setup functions and the Denops instance.
 */
export type Entrypoint = (params: {
  denops: Denops;
  definePickerFromSource: DefinePickerFromSource;
  definePickerFromCurator: DefinePickerFromCurator;
  refineActionPicker: RefineActionPicker;
  refineSetting: RefineSetting;
}) => void | Promise<void>;

export type {
  DefinePickerFromCurator,
  DefinePickerFromSource,
} from "./picker.ts";
export type { RefineActionPicker } from "./action_picker.ts";
export type { RefineSetting } from "./setting.ts";
