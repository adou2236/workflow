import type { ContextMenuItem } from '../components/ContextMenu';
export type { ContextMenuItem };
export declare function useContextMenu(authRemove?: boolean): (((options: import('../components/ContextMenu').CreateContextOptions) => Promise<unknown> | undefined) | (() => void))[];
