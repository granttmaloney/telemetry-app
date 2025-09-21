import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineCog, HiOutlineSparkles, HiOutlineChartBar, HiOutlineDeviceTablet } from 'react-icons/hi';

interface PlotPreset {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  channels: string[];
  yScale: 'linear' | 'log';
}

type StoredPreset = Pick<PlotPreset, 'id' | 'channels' | 'yScale'>;

const DEFAULT_PRESETS: PlotPreset[] = [
  {
    id: 'engine-performance',
    title: 'Engine Performance',
    description: 'Engine temperatures and manifold pressure for quick health checks.',
    icon: <HiOutlineCog />,
    channels: ['engine.temp_A', 'engine.temp_B', 'pneumatics.pressure'],
    yScale: 'linear'
  },
  {
    id: 'vibration-monitor',
    title: 'Vibration Monitor',
    description: 'IMU acceleration channels to spot vibration spikes.',
    icon: <HiOutlineSparkles />,
    channels: ['imu.accel_x', 'imu.accel_y', 'imu.accel_z'],
    yScale: 'linear'
  },
  {
    id: 'power-quality',
    title: 'Power Quality',
    description: 'Track bus voltage and convertor performance.',
    icon: <HiOutlineChartBar />,
    channels: ['power.bus_voltage'],
    yScale: 'linear'
  },
  {
    id: 'custom-analysis',
    title: 'Custom Analysis',
    description: 'A blank preset you can customise for ad-hoc investigations.',
    icon: <HiOutlineDeviceTablet />,
    channels: [],
    yScale: 'linear'
  }
];

const STORAGE_KEY = 'plot-presets';

const loadStoredPresets = (): PlotPreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PRESETS;
    }

    const parsed: StoredPreset[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DEFAULT_PRESETS;
    }

    const presetMap = new Map(parsed.map((item) => [item.id, item]));

    return DEFAULT_PRESETS.map((preset) => {
      const stored = presetMap.get(preset.id);
      if (!stored) {
        return preset;
      }

      return {
        ...preset,
        channels: stored.channels ?? preset.channels,
        yScale: stored.yScale ?? preset.yScale
      };
    });
  } catch (error) {
    console.warn('Failed to read stored presets', error);
    return DEFAULT_PRESETS;
  }
};

const persistPresets = (presets: PlotPreset[]) => {
  const payload: StoredPreset[] = presets.map(({ id, channels, yScale }) => ({
    id,
    channels,
    yScale
  }));

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to persist presets', error);
  }
};

interface WindowConfig {
  openPlotWindows: string[];
}

const DashboardPage: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState<PlotPreset[]>(() => loadStoredPresets());

  useEffect(() => {
    let mounted = true;

    async function fetchConfig() {
      if (!window.electronAPI?.getWindowConfig) {
        setLoading(false);
        return;
      }

      try {
        const config = await window.electronAPI.getWindowConfig();
        if (mounted) {
          setOpenWindows(config.openPlotWindows ?? []);
        }
      } catch (error) {
        console.error('Failed to load window configuration', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchConfig();

    const timer = setInterval(fetchConfig, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const handlePresetLaunch = async (preset: PlotPreset) => {
    try {
      await window.electronAPI?.createPlotWindow?.({
        plotId: preset.id,
        channels: preset.channels,
        settings: {
          yScale: preset.yScale
        }
      });
    } catch (error) {
      console.error('Failed to launch preset window', error);
    }
  };

  const updatePreset = (presetId: string, updates: Partial<PlotPreset>) => {
    setPresets((current) => {
      const next = current.map((preset) =>
        preset.id === presetId ? { ...preset, ...updates } : preset
      );
      persistPresets(next);
      return next;
    });
  };

  return (
    <section className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Quick Launch</h2>
          <p className="muted">
            Spin up preconfigured plot windows or curate your favourites for common workflows.
          </p>
        </div>
        <div className="dashboard-status">Backend status: {window.electronAPI ? 'Connected' : 'Unavailable'}</div>
      </header>

      <div className="preset-grid">
        {presets.map((preset) => (
          <article key={preset.id} className="preset-card">
            <div className="preset-icon" aria-hidden="true">
              {preset.icon}
            </div>
            <div className="preset-content">
              <header>
                <h3>{preset.title}</h3>
                <p className="muted">{preset.description}</p>
              </header>
              <div className="preset-meta">
                {preset.channels.length > 0 ? (
                  <span>{preset.channels.length} channel{preset.channels.length === 1 ? '' : 's'}</span>
                ) : (
                  <span>No channels selected yet</span>
                )}
                <span>Scale: {preset.yScale}</span>
              </div>
              <div className="preset-actions">
                <button className="primary" onClick={() => handlePresetLaunch(preset)}>
                  Open Window
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    updatePreset(preset.id, {
                      yScale: preset.yScale === 'linear' ? 'log' : 'linear'
                    })
                  }
                >
                  Toggle Scale
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="dashboard-secondary">
        <div className="card">
          <h3>Open Plot Windows</h3>
          {loading ? (
            <p>Loading...</p>
          ) : openWindows.length === 0 ? (
            <p>No plot windows are currently open.</p>
          ) : (
            <ul>
              {openWindows.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>Preset Tips</h3>
          <ul className="muted">
            <li>Click “Toggle Scale” to switch between linear and logarithmic views.</li>
            <li>Presets are saved locally and persist across sessions.</li>
            <li>Future updates will let you edit channel lists directly.</li>
          </ul>
        </div>
      </section>
    </section>
  );
};

export default DashboardPage;
