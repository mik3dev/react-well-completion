export interface BrandTheme {
  headerBg: string;
  accent: string;
  headerText: string;
  /**
   * Fill used by the EarthLayer (formation pattern beside the casing/liner).
   * Defaults to the SVG pattern `url(#earthFill)` defined in `<SvgDefs>`.
   * Set to `'transparent'`, `'#ffffff'`, or any CSS color to override.
   */
  earthFill: string;
}

export const defaultTheme: BrandTheme = {
  headerBg: '#205394',
  accent: '#377AF3',
  headerText: '#FFFFFF',
  earthFill: 'url(#earthFill)',
};
