import React, { useMemo, useState } from 'react';

interface TelemetryChannel {
  id: string;
  name: string;
  source: string;
  description?: string;
}

interface StandardChannel {
  id: string;
  label: string;
  units: string[];
  supportsSecondary?: boolean;
}

interface ChannelAssignment {
  channel: TelemetryChannel;
  standardId: string | null;
  units: string | null;
  secondaryId: string | null;
}

const TELEMETRY_CHANNELS: TelemetryChannel[] = [
  { id: 'engine.temp_A', name: 'Engine Temperature A', source: 'Engine Rack', description: 'Thermocouple mounted on intake manifold' },
  { id: 'engine.temp_B', name: 'Engine Temperature B', source: 'Engine Rack', description: 'Thermocouple mounted on exhaust manifold' },
  { id: 'pneumatics.pressure', name: 'Pneumatics Pressure', source: 'PDU', description: 'Main pneumatic manifold pressure transducer' },
  { id: 'coolant.flow_rate', name: 'Coolant Flow Rate', source: 'Cooling Loop', description: 'Magnetic flow sensor inside return line' },
  { id: 'imu.accel_x', name: 'IMU Acceleration X', source: 'Navigation IMU', description: 'Linear acceleration along vehicle X axis' },
  { id: 'imu.accel_y', name: 'IMU Acceleration Y', source: 'Navigation IMU' },
  { id: 'imu.accel_z', name: 'IMU Acceleration Z', source: 'Navigation IMU' },
  { id: 'power.bus_voltage', name: 'Bus Voltage', source: 'Power Module', description: 'Main 28V DC bus measurement' }
];

const STANDARD_CHANNELS: StandardChannel[] = [
  { id: 'temperature', label: 'Temperature', units: ['°C', '°F', 'K'] },
  { id: 'pressure', label: 'Pressure', units: ['kPa', 'psi', 'bar'] },
  { id: 'flow_rate', label: 'Flow Rate', units: ['L/min', 'm³/h', 'gpm'] },
  { id: 'accel_x', label: 'Acceleration X', units: ['m/s²', 'g'], supportsSecondary: true },
  { id: 'accel_y', label: 'Acceleration Y', units: ['m/s²', 'g'], supportsSecondary: true },
  { id: 'accel_z', label: 'Acceleration Z', units: ['m/s²', 'g'], supportsSecondary: true },
  { id: 'bus_voltage', label: 'Bus Voltage', units: ['V'] },
  { id: 'custom', label: 'Custom Mapping', units: ['unit'] }
];

const SECONDARY_OPTIONS: Record<string, { id: string; label: string }[]> = {
  accel_x: [
    { id: 'accel_x_peak', label: 'Peak Acceleration' },
    { id: 'accel_x_rms', label: 'RMS Acceleration' }
  ],
  accel_y: [
    { id: 'accel_y_peak', label: 'Peak Acceleration' },
    { id: 'accel_y_rms', label: 'RMS Acceleration' }
  ],
  accel_z: [
    { id: 'accel_z_peak', label: 'Peak Acceleration' },
    { id: 'accel_z_rms', label: 'RMS Acceleration' }
  ]
};

const inferInitialMapping = (channel: TelemetryChannel): string | null => {
  const lowerName = channel.name.toLowerCase();
  const lowerId = channel.id.toLowerCase();

  const lookup: Record<string, string> = {
    temperature: 'temperature',
    temp: 'temperature',
    pressure: 'pressure',
    flow: 'flow_rate',
    accel_x: 'accel_x',
    accel_y: 'accel_y',
    accel_z: 'accel_z',
    voltage: 'bus_voltage',
    bus: 'bus_voltage'
  };

  for (const [needle, target] of Object.entries(lookup)) {
    if (lowerName.includes(needle) || lowerId.includes(needle)) {
      return target;
    }
  }

  return null;
};

const createAssignment = (channel: TelemetryChannel): ChannelAssignment => {
  const inferred = inferInitialMapping(channel);
  const standard = inferred ? STANDARD_CHANNELS.find((item) => item.id === inferred) : undefined;

  return {
    channel,
    standardId: inferred,
    units: standard ? standard.units[0] : null,
    secondaryId: null
  };
};

const ChannelSetupPage: React.FC = () => {
  const [assignments, setAssignments] = useState<ChannelAssignment[]>(() =>
    TELEMETRY_CHANNELS.map((channel) => createAssignment(channel))
  );

  const assignedCount = useMemo(
    () => assignments.filter((assignment) => assignment.standardId).length,
    [assignments]
  );

  const handleMappingChange = (channelId: string, standardId: string) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.channel.id === channelId
          ? (() => {
              if (!standardId) {
                return { ...assignment, standardId: null, units: null, secondaryId: null };
              }

              const standard = STANDARD_CHANNELS.find((item) => item.id === standardId);
              const defaultUnits = standard ? standard.units[0] : null;
              const supportsSecondary = Boolean(standard?.supportsSecondary);
              const hasChanged = assignment.standardId !== standardId;
              const secondaryOptions = standardId ? SECONDARY_OPTIONS[standardId] ?? [] : [];
              const nextSecondary = supportsSecondary
                ? hasChanged
                  ? null
                  : assignment.secondaryId && secondaryOptions.some((option) => option.id === assignment.secondaryId)
                    ? assignment.secondaryId
                    : null
                : null;

              return {
                ...assignment,
                standardId,
                units: defaultUnits,
                secondaryId: nextSecondary
              };
            })()
          : assignment
      )
    );
  };

  const handleUnitsChange = (channelId: string, units: string) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.channel.id === channelId ? { ...assignment, units } : assignment
      )
    );
  };

  const handleSecondaryChange = (channelId: string, secondaryId: string) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.channel.id === channelId ? { ...assignment, secondaryId: secondaryId || null } : assignment
      )
    );
  };

  const resetMappings = () => {
    setAssignments(TELEMETRY_CHANNELS.map((channel) => createAssignment(channel)));
  };

  const pendingChannels = assignments.filter((assignment) => !assignment.standardId);

  return (
    <section className="channel-setup">
      <header className="channel-setup__header">
        <div>
          <h2>Channel Setup</h2>
          <p className="muted">
            Map incoming telemetry channel names to standardized signal categories so downstream
            visualizations and alerts can operate on consistent data types.
          </p>
        </div>
        <div className="channel-setup__actions">
          <span className="channel-setup__summary">
            <strong>{assignedCount}</strong> of {assignments.length} channels assigned
          </span>
          <button type="button" className="secondary" onClick={resetMappings}>
            Reset Suggestions
          </button>
        </div>
      </header>

      {pendingChannels.length > 0 && (
        <div className="channel-setup__alert" role="status">
          {pendingChannels.length} channel{pendingChannels.length === 1 ? '' : 's'} still need a mapping.
        </div>
      )}

      <div className="channel-setup__table-wrapper">
        <table className="channel-table">
          <thead>
            <tr>
              <th className="channel-col-name">Telemetry Channel</th>
              <th className="channel-col-mapping">Standard Mapping</th>
              <th className="channel-col-units">Units</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(({ channel, standardId, units, secondaryId }) => {
              const standard = standardId
                ? STANDARD_CHANNELS.find((item) => item.id === standardId)
                : undefined;
              const supportsSecondary = Boolean(standard?.supportsSecondary);

              const secondaryOptions = supportsSecondary
                ? SECONDARY_OPTIONS[standardId!] ?? []
                : [];

              const availableUnits = standard?.units ?? [];

              return (
                <tr key={channel.id} className={standardId ? '' : 'channel-row--pending'}>
                  <td>
                    <div className="channel-name">{channel.name}</div>
                    <div className="channel-id muted">{channel.id}</div>
                  </td>
                  <td>
                    <select
                      className="channel-select"
                      value={standardId ?? ''}
                      onChange={(event) => handleMappingChange(channel.id, event.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {STANDARD_CHANNELS.map((standard) => (
                        <option key={standard.id} value={standard.id}>
                          {standard.label}
                        </option>
                      ))}
                    </select>
                    {supportsSecondary && (
                      <div className="channel-secondary">
                        <label>
                          Secondary mapping
                          <select
                            value={secondaryId ?? ''}
                            onChange={(event) => handleSecondaryChange(channel.id, event.target.value)}
                          >
                            <option value="">None</option>
                            {secondaryOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="channel-col-units">
                    <select
                      className="channel-select"
                      value={units ?? ''}
                      onChange={(event) => handleUnitsChange(channel.id, event.target.value)}
                      disabled={!availableUnits.length}
                    >
                      {availableUnits.length === 0 && <option value="">N/A</option>}
                      {availableUnits.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="channel-setup__footer">
        <p className="muted">
          Once mappings are finalized, they can be synchronized with the backend service so every plot
          window and automated alert references the same standardized channel identifiers.
        </p>
        <button type="button" className="primary" disabled>
          Save Mappings (Coming Soon)
        </button>
      </footer>
    </section>
  );
};

export default ChannelSetupPage;
