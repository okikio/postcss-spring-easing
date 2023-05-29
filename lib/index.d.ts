import type { TypeCSSEasingOptions, TypeFrameFunction } from 'spring-easing';
import type { PluginCreator } from 'postcss';
export declare function toSnake(str: string): string;
export declare function toCamel(str: string): string;
export type PluginOpts = Omit<TypeCSSEasingOptions, "easing"> & {
    easings?: Record<string, TypeFrameFunction>;
};
export declare const springEasingPlugin: PluginCreator<PluginOpts>;
export declare const postcss = true;
export default springEasingPlugin;
//# sourceMappingURL=index.d.ts.map