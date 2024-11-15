import type { Denops } from "@denops/std";
import type { Action } from "@vim-fall/core/action";
import type { CollectParams, Source } from "@vim-fall/core/source";
import type { Curator } from "@vim-fall/core/curator";
import type { Coordinator } from "@vim-fall/core/coordinator";
import type { Detail, DetailUnit, IdItem } from "@vim-fall/core/item";
import type { Matcher, MatchParams } from "@vim-fall/core/matcher";
import type { Previewer } from "@vim-fall/core/previewer";
import type { Renderer } from "@vim-fall/core/renderer";
import type { Sorter } from "@vim-fall/core/sorter";
import type { Theme } from "@vim-fall/core/theme";

import {
  type Derivable,
  type DerivableArray,
  type DerivableMap,
  derive,
  deriveArray,
  deriveMap,
} from "./derivable.ts";

type Actions<T extends Detail = Detail, A extends string = string> =
  & Record<string, Action<T>>
  & { [key in A]: Action<T> };

/**
 * Parameters required to configure an item picker.
 *
 * @template T - The type of items in the picker.
 * @template A - The type representing the default action name.
 */
export type ItemPickerParams<
  T extends Detail = Detail,
  A extends string = string,
> = {
  name: string;
  source: Source<T>;
  actions: Actions<T, NoInfer<A>>;
  defaultAction: A;
  matchers: readonly [Matcher<NoInfer<T>>, ...Matcher<NoInfer<T>>[]];
  sorters?: readonly Sorter<NoInfer<T>>[];
  renderers?: readonly Renderer<NoInfer<T>>[];
  previewers?: readonly Previewer<NoInfer<T>>[];
  coordinator?: Coordinator;
  theme?: Theme;
};

/**
 * Defines an item picker based on a source and matchers.
 *
 * @template T - The type of items handled by the picker.
 * @template A - The type representing the default action name.
 */
export type DefineItemPickerFromSource = <T extends Detail, A extends string>(
  name: string,
  source: Derivable<Source<T>>,
  params: {
    actions: DerivableMap<Actions<NoInfer<T>, NoInfer<A>>>;
    defaultAction: A;
    matchers: DerivableArray<
      readonly [Matcher<NoInfer<T>>, ...Matcher<NoInfer<T>>[]]
    >;
    sorters?: DerivableArray<readonly Sorter<NoInfer<T>>[]>;
    renderers?: DerivableArray<readonly Renderer<NoInfer<T>>[]>;
    previewers?: DerivableArray<readonly Previewer<NoInfer<T>>[]>;
    coordinator?: Derivable<Coordinator>;
    theme?: Derivable<Theme>;
  },
) => void;

/**
 * Defines an item picker based on a curator.
 *
 * @template T - The type of items handled by the picker.
 * @template A - The type representing the default action name.
 */
export type DefineItemPickerFromCurator = <T extends Detail, A extends string>(
  name: string,
  curator: Derivable<Curator<T>>,
  params: {
    actions: DerivableMap<Actions<NoInfer<T>, NoInfer<A>>>;
    defaultAction: A;
    sorters?: DerivableArray<readonly Sorter<NoInfer<T>>[]>;
    renderers?: DerivableArray<readonly Renderer<NoInfer<T>>[]>;
    previewers?: DerivableArray<readonly Previewer<NoInfer<T>>[]>;
    coordinator?: Derivable<Coordinator>;
    theme?: Derivable<Theme>;
  },
) => void;

/**
 * Builds a function to define an item picker based on a source and matchers with the given map.
 *
 * @param itemPickerParamsMap - The map to store the defined item pickers.
 * @returns The function to define an item picker based on a source and matchers.
 */
export function buildDefineItemPickerFromSource(
  itemPickerParamsMap: Map<string, ItemPickerParams<Detail>>,
): DefineItemPickerFromSource {
  function validatePickerName(name: string): void {
    if (itemPickerParamsMap.has(name)) {
      throw new Error(`Item picker "${name}" is already defined.`);
    }
    if (name.startsWith("@")) {
      throw new Error(`Name "${name}" must not start with "@".`);
    }
  }
  return (
    name,
    source,
    params,
  ) => {
    if (itemPickerParamsMap.has(name)) {
      throw new Error(`Item picker "${name}" is already defined.`);
    }
    validatePickerName(name);
    const derivedParams = omitUndefinedAttributes({
      actions: deriveMap(params.actions) as Actions,
      defaultAction: params.defaultAction,
      matchers: deriveArray(params.matchers),
      sorters: params.sorters ? deriveArray(params.sorters) : undefined,
      renderers: params.renderers ? deriveArray(params.renderers) : undefined,
      previewers: params.previewers
        ? deriveArray(params.previewers)
        : undefined,
      coordinator: derive(params.coordinator),
      theme: derive(params.theme),
    });
    validateActions(derivedParams.actions);
    itemPickerParamsMap.set(name, {
      ...derivedParams,
      name,
      source: derive(source),
    } as ItemPickerParams<Detail, string>);
  };
}

/**
 * Builds a function to define an item picker based on a curator with the given map.
 *
 * @param itemPickerParamsMap - The map to store the defined item pickers.
 * @returns The function to define an item picker based on a curator.
 */
export function buildDefineItemPickerFromCurator(
  itemPickerParamsMap: Map<string, ItemPickerParams<Detail>>,
): DefineItemPickerFromCurator {
  function validatePickerName(name: string): void {
    if (itemPickerParamsMap.has(name)) {
      throw new Error(`Item picker "${name}" is already defined.`);
    }
    if (name.startsWith("@")) {
      throw new Error(`Name "${name}" must not start with "@".`);
    }
  }
  return (
    name,
    curator,
    params,
  ) => {
    validatePickerName(name);
    const source = new CuratorSourceMatcher(derive(curator));
    const derivedParams = omitUndefinedAttributes({
      actions: deriveMap(params.actions) as Actions,
      defaultAction: params.defaultAction,
      sorters: params.sorters ? deriveArray(params.sorters) : undefined,
      renderers: params.renderers ? deriveArray(params.renderers) : undefined,
      previewers: params.previewers
        ? deriveArray(params.previewers)
        : undefined,
      coordinator: derive(params.coordinator),
      theme: derive(params.theme),
    });
    validateActions(derivedParams.actions);
    itemPickerParamsMap.set(name, {
      ...derivedParams,
      name,
      source,
      matchers: [source as Matcher<DetailUnit>],
    });
  };
}

class CuratorSourceMatcher<T extends Detail> implements Source<T>, Matcher<T> {
  #curator: Curator<T>;
  #args?: readonly string[];

  // This attribute is referred in Picker to determine if MatchProcessor
  // should be 'incremental'
  readonly incremental = true;

  constructor(curator: Curator<T>) {
    this.#curator = curator;
  }

  async *collect(
    _denops: Denops,
    params: CollectParams,
    _options: { signal?: AbortSignal },
  ) {
    this.#args = params.args;
    yield* [];
  }

  async *match<V extends T>(
    denops: Denops,
    params: MatchParams<V>,
    options: { signal?: AbortSignal },
  ): AsyncIterableIterator<IdItem<V>> {
    if (!this.#args) {
      throw new Error("Collect is not called before match.");
    }
    const curatorParams = {
      ...params,
      args: this.#args,
    };
    yield* this.#curator.curate(
      denops,
      curatorParams,
      options,
    ) as AsyncIterableIterator<IdItem<V>>;
  }
}

function omitUndefinedAttributes<
  M extends Record<PropertyKey, unknown>,
  R extends { [K in keyof M]: M[K] extends undefined ? never : M[K] },
>(
  map: M,
): R {
  return Object.fromEntries(
    Object.entries(map).filter(([, v]) => v !== undefined),
  ) as R;
}

function validateActions(actions: Record<string, Action>): void {
  Object.entries(actions).forEach(([name, _action]) => {
    if (name.startsWith("@")) {
      throw new Error(`Action name "${name}" must not start with "@".`);
    }
  });
}
