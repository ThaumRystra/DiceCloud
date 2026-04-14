declare module 'css-box-shadow' {
  export interface BoxShadow {
    inset: boolean;
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadRadius: number | undefined;
    color: string | undefined;
  }

  export interface BoxShadowInput {
    inset?: boolean;
    offsetX?: number | string;
    offsetY?: number | string;
    blurRadius?: number | string;
    spreadRadius?: number | string;
    color?: string;
  }

  /**
   * Parse a CSS box-shadow string into an array of shadow objects
   */
  export function parse(str: string): BoxShadow[];

  /**
   * Stringify an array of shadow objects into a CSS box-shadow string
   */
  export function stringify(arr: BoxShadowInput[]): string;
}
