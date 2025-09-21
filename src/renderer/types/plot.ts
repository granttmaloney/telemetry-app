export type AxisScale = 'linear' | 'log';

export interface AxisRange {
  min: number | null;
  max: number | null;
}

export interface ChannelConfig {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  axisId: 'y' | `y${number}`;
  scale: AxisScale;
  range: AxisRange;
}

export interface PlotSettings {
  channels: ChannelConfig[];
  xRange: AxisRange;
  showHoverLine: boolean;
}
