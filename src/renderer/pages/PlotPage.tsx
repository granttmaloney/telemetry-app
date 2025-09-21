import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { useParams } from 'react-router-dom';
import type { PlotData, Layout, LayoutAxis } from 'plotly.js';

import type { PlotSettings, ChannelConfig, AxisScale, AxisRange } from '@renderer/types/plot';

const createDefaultChannels = (): ChannelConfig[] => [
  {
    id: 'temperature',
    label: 'Temperature (°C)',
    color: '#f97316',
    enabled: true,
    axisId: 'y',
    scale: 'linear',
    range: { min: null, max: null },
  },
  {
    id: 'pressure',
    label: 'Pressure (kPa)',
    color: '#22d3ee',
    enabled: true,
    axisId: 'y2',
    scale: 'linear',
    range: { min: null, max: null },
  },
  {
    id: 'humidity',
    label: 'Humidity (%)',
    color: '#a855f7',
    enabled: false,
    axisId: 'y3',
    scale: 'linear',
    range: { min: null, max: null },
  },
];

const generateSeriesData = (channel: ChannelConfig, hoverEnabled: boolean, points = 120): PlotData => {
  const xValues = Array.from({ length: points }, (_, index) => index);
  const phaseShift = Math.random() + channel.id.length;

  const yValues = xValues.map((x) => {
    const base = Math.sin((x / 12) + phaseShift);
    switch (channel.id) {
      case 'temperature':
        return base * 5 + 22;
      case 'pressure':
        return base * 3 + 101;
      case 'humidity':
        return base * 10 + 50;
      default:
        return base;
    }
  });

  return {
    x: xValues,
    y: yValues,
    type: 'scatter',
    mode: 'lines',
    name: channel.label,
    line: {
      color: channel.color,
      width: 2,
    },
    yaxis: channel.axisId,
    hoverinfo: hoverEnabled ? 'x+y+name' : 'skip',
  } as PlotData;
};

const toPlotlyRange = (range: AxisRange): [number | null, number | null] | undefined => {
  if (range.min === null && range.max === null) {
    return undefined;
  }
  return [range.min ?? null, range.max ?? null];
};

const PlotPage: React.FC = () => {
  const { plotId } = useParams();

  const [settings, setSettings] = useState<PlotSettings>(() => ({
    channels: createDefaultChannels(),
    xRange: { min: null, max: null },
    showHoverLine: true,
  }));

  const [showSettings, setShowSettings] = useState(false);

  const activeChannels = useMemo(
    () => settings.channels.filter((channel) => channel.enabled),
    [settings.channels]
  );

  const traces = useMemo<PlotData[]>(() => {
    return activeChannels.map((channel) => generateSeriesData(channel, settings.showHoverLine));
  }, [activeChannels, settings.showHoverLine]);

  const layout = useMemo<Partial<Layout>>(() => {
    const axisSources = activeChannels.length > 0 ? activeChannels : [settings.channels[0]];

    const baseLayout: Partial<Layout> = {
      title: {
        text: plotId ? `Telemetry Plot • ${plotId}` : 'Telemetry Plot',
        font: { size: 20 },
      },
      paper_bgcolor: '#111827',
      plot_bgcolor: '#111827',
      font: { color: '#f3f4f6', family: 'Roboto, sans-serif' },
      xaxis: {
        title: { text: 'Sample' },
        automargin: true,
        gridcolor: 'rgba(255,255,255,0.05)',
        range: toPlotlyRange(settings.xRange),
      },
      margin: { l: 60, r: 20, t: 60, b: 60 },
      autosize: true,
      showlegend: true,
      legend: {
        orientation: 'h',
        yanchor: 'bottom',
        y: -0.2,
        x: 0,
      },
    };

    if (settings.showHoverLine) {
      baseLayout.hovermode = 'x unified';
      baseLayout.hoverlabel = {
        bgcolor: 'rgba(15, 23, 42, 0.9)',
        font: { family: 'Roboto, sans-serif', color: '#f8fafc' },
      };
    }

    axisSources.forEach((channel, index) => {
      if (!channel) {
        return;
      }

      const layoutAxisKey = channel.axisId === 'y' ? 'yaxis' : `yaxis${channel.axisId.slice(1)}`;
      const axisConfig: Partial<LayoutAxis> = {
        title: { text: channel.label, font: { color: channel.color, family: 'Roboto, sans-serif' } },
        automargin: true,
        type: channel.scale,
        range: toPlotlyRange(channel.range),
        tickfont: { color: channel.color, family: 'Roboto, sans-serif' },
      };

      if (index === 0) {
        axisConfig.side = 'left';
        axisConfig.gridcolor = 'rgba(255,255,255,0.08)';
      } else {
        axisConfig.side = 'right';
        axisConfig.overlaying = 'y';
        axisConfig.showgrid = false;
        axisConfig.position = Math.max(0.7, 1 - (index - 1) * 0.08);
      }

      (baseLayout as Record<string, unknown>)[layoutAxisKey] = axisConfig;
    });

    return baseLayout;
  }, [activeChannels, plotId, settings.channels, settings.xRange]);

  const toggleChannel = (channelId: string) => {
    setSettings((current) => ({
      ...current,
      channels: current.channels.map((channel) =>
        channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel
      ),
    }));
  };

  const updateChannelColor = (channelId: string, color: string) => {
    setSettings((current) => ({
      ...current,
      channels: current.channels.map((channel) =>
        channel.id === channelId ? { ...channel, color } : channel
      ),
    }));
  };

  const updateChannelScale = (channelId: string, scale: AxisScale) => {
    setSettings((current) => ({
      ...current,
      channels: current.channels.map((channel) =>
        channel.id === channelId ? { ...channel, scale } : channel
      ),
    }));
  };

  const updateChannelRange = (channelId: string, bound: 'min' | 'max', value: string) => {
    const parsed = value === '' ? null : Number(value);
    if (value !== '' && Number.isNaN(parsed)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      channels: current.channels.map((channel) =>
        channel.id === channelId
          ? { ...channel, range: { ...channel.range, [bound]: parsed } }
          : channel
      ),
    }));
  };

  const updateXRange = (bound: 'min' | 'max', value: string) => {
    const parsed = value === '' ? null : Number(value);
    if (value !== '' && Number.isNaN(parsed)) {
      return;
    }

    setSettings((current) => ({
      ...current,
      xRange: {
        ...current.xRange,
        [bound]: parsed,
      },
    }));
  };

  const toggleHoverLine = (enabled: boolean) => {
    setSettings((current) => ({
      ...current,
      showHoverLine: enabled,
    }));
  };

  return (
    <section className="plot-page">
      <div className="plot-header">
        <div>
          <h2>{plotId ? `Plot: ${plotId}` : 'Plot Window'}</h2>
          <p className="muted">Configure channels, colors, and scales from the settings panel.</p>
        </div>
        <button className="settings-toggle" onClick={() => setShowSettings((value) => !value)}>
          {showSettings ? 'Close Settings' : 'Open Settings'}
        </button>
      </div>
      <div className="plot-content">
        {showSettings && (
          <aside className="plot-settings">
            <h3>Plot Settings</h3>
            <div className="settings-group">
              <span className="settings-label">X-Axis Range</span>
              <div className="axis-range-group axis-range-group--single">
                <label>
                  Min
                  <input
                    type="number"
                    value={settings.xRange.min ?? ''}
                    onChange={(event) => updateXRange('min', event.target.value)}
                  />
                </label>
                <label>
                  Max
                  <input
                    type="number"
                    value={settings.xRange.max ?? ''}
                    onChange={(event) => updateXRange('max', event.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="settings-group">
              <span className="settings-label">Tooltip</span>
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={settings.showHoverLine}
                  onChange={(event) => toggleHoverLine(event.target.checked)}
                />
                <span>Show unified vertical hover line</span>
              </label>
            </div>
            <div className="settings-group">
              <span className="settings-label">Channels</span>
              <ul className="channel-list">
                {settings.channels.map((channel) => (
                  <li key={channel.id} className="channel-item">
                    <div className="channel-row">
                      <label className="channel-toggle">
                        <input
                          type="checkbox"
                          checked={channel.enabled}
                          onChange={() => toggleChannel(channel.id)}
                        />
                        <span>{channel.label}</span>
                      </label>
                      <input
                        type="color"
                        value={channel.color}
                        onChange={(event) => updateChannelColor(channel.id, event.target.value)}
                        aria-label={`Color for ${channel.label}`}
                      />
                    </div>
                    <div className="channel-controls">
                      <label className="channel-scale">
                        <span>Scale</span>
                        <select
                          value={channel.scale}
                          onChange={(event) =>
                            updateChannelScale(channel.id, event.target.value as AxisScale)
                          }
                        >
                          <option value="linear">Linear</option>
                          <option value="log">Log</option>
                        </select>
                      </label>
                      <div className="channel-range">
                        <label>
                          Min
                          <input
                            type="number"
                            value={channel.range.min ?? ''}
                            onChange={(event) =>
                              updateChannelRange(channel.id, 'min', event.target.value)
                            }
                          />
                        </label>
                        <label>
                          Max
                          <input
                            type="number"
                            value={channel.range.max ?? ''}
                            onChange={(event) =>
                              updateChannelRange(channel.id, 'max', event.target.value)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
        <div className="plot-wrapper">
          <Plot
            className="plot-canvas"
            data={
              traces.length > 0
                ? traces
                : settings.channels[0]
                ? [generateSeriesData(settings.channels[0], settings.showHoverLine)]
                : []
            }
            layout={layout}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false, responsive: true }}
          />
        </div>
      </div>
    </section>
  );
};

export default PlotPage;
