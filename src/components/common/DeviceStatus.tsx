import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  IconButton,
  useTheme,
} from 'react-native-paper';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';
import { useResponsive } from '../../utils/responsive';

interface DeviceStatus {
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  isConnected: boolean;
  isInternetReachable: boolean;
}

export const DeviceStatus: React.FC = () => {
  const { isPhone, spacing } = useResponsive();
  const theme = useTheme();
  const [status, setStatus] = useState<DeviceStatus>({
    batteryLevel: 0,
    isCharging: false,
    networkType: 'unknown',
    isConnected: false,
    isInternetReachable: false,
  });

  useEffect(() => {
    if (!isPhone) return;

    // Battery monitoring
    const setupBatteryMonitoring = async () => {
      try {
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const isCharging = await Battery.isChargingAsync();
        
        setStatus(prev => ({
          ...prev,
          batteryLevel,
          isCharging,
        }));

        // Listen for battery changes
        Battery.addBatteryLevelListener(({ batteryLevel }) => {
          setStatus(prev => ({ ...prev, batteryLevel }));
        });

        Battery.addBatteryStateListener(({ batteryState }) => {
          const isCharging = batteryState === Battery.BatteryState.CHARGING;
          setStatus(prev => ({ ...prev, isCharging }));
        });
      } catch (error) {
        console.warn('Battery monitoring not available:', error);
      }
    };

    // Network monitoring
    const setupNetworkMonitoring = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const isInternetReachable = await Network.isAvailableAsync();
        
        setStatus(prev => ({
          ...prev,
          networkType: networkState.type,
          isConnected: networkState.isConnected,
          isInternetReachable,
        }));

        // Listen for network changes
        Network.addNetworkStateListener(({ type, isConnected }) => {
          setStatus(prev => ({
            ...prev,
            networkType: type,
            isConnected,
          }));
        });
      } catch (error) {
        console.warn('Network monitoring not available:', error);
      }
    };

    setupBatteryMonitoring();
    setupNetworkMonitoring();
  }, [isPhone]);
  }, [isPhone]);

  if (!isPhone) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title>Device Status</Title>
          <Paragraph>Device status monitoring is only available on mobile devices.</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  const getBatteryIcon = () => {
    if (status.isCharging) return 'battery-charging';
    if (status.batteryLevel > 0.8) return 'battery';
    if (status.batteryLevel > 0.5) return 'battery-50';
    if (status.batteryLevel > 0.2) return 'battery-20';
    return 'battery-alert';
  };

  const getBatteryColor = () => {
    if (status.isCharging) return theme.colors.primary;
    if (status.batteryLevel > 0.5) return theme.colors.success;
    if (status.batteryLevel > 0.2) return theme.colors.warning;
    return theme.colors.error;
  };

  const getNetworkIcon = () => {
    if (!status.isConnected) return 'wifi-off';
    if (status.networkType === 'wifi') return 'wifi';
    if (status.networkType === 'cellular') return 'cellphone';
    return 'wifi-strength-1';
  };

  const getNetworkColor = () => {
    if (!status.isConnected) return theme.colors.error;
    if (status.isInternetReachable) return theme.colors.success;
    return theme.colors.warning;
  };

  return (
    <View style={styles.container}>
      {/* Battery Status */}
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <IconButton
              icon={getBatteryIcon()}
              size={24}
              iconColor={getBatteryColor()}
            />
            <Title style={styles.statusTitle}>Battery</Title>
          </View>
          <Paragraph style={styles.statusText}>
            {Math.round(status.batteryLevel * 100)}%
            {status.isCharging && ' (Charging)'}
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Network Status */}
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <IconButton
              icon={getNetworkIcon()}
              size={24}
              iconColor={getNetworkColor()}
            />
            <Title style={styles.statusTitle}>Network</Title>
          </View>
          <Paragraph style={styles.statusText}>
            {status.networkType.toUpperCase()}
            {status.isInternetReachable ? ' (Connected)' : ' (No Internet)'}
          </Paragraph>
        </Card.Content>
      </Card>



      {/* Device Info */}
      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View style={styles.statusHeader}>
            <IconButton
              icon="information"
              size={24}
              iconColor={theme.colors.primary}
            />
            <Title style={styles.statusTitle}>Device Info</Title>
          </View>
          <Paragraph style={styles.statusText}>
            Platform: {Platform.OS.toUpperCase()}
          </Paragraph>
          <Paragraph style={styles.statusText}>
            Version: {Platform.Version}
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

// Battery level hook
export const useBatteryLevel = () => {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const { isPhone } = useResponsive();

  useEffect(() => {
    if (!isPhone) return;

    const setupBatteryMonitoring = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        const charging = await Battery.isChargingAsync();
        
        setBatteryLevel(level);
        setIsCharging(charging);

        Battery.addBatteryLevelListener(({ batteryLevel }) => {
          setBatteryLevel(batteryLevel);
        });

        Battery.addBatteryStateListener(({ batteryState }) => {
          setIsCharging(batteryState === Battery.BatteryState.CHARGING);
        });
      } catch (error) {
        console.warn('Battery monitoring not available:', error);
      }
    };

    setupBatteryMonitoring();
  }, [isPhone]);

  return { batteryLevel, isCharging };
};

// Network status hook
export const useNetworkStatus = () => {
  const [networkType, setNetworkType] = useState('unknown');
  const [isConnected, setIsConnected] = useState(false);
  const [isInternetReachable, setIsInternetReachable] = useState(false);
  const { isPhone } = useResponsive();

  useEffect(() => {
    if (!isPhone) return;

    const setupNetworkMonitoring = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const internetReachable = await Network.isAvailableAsync();
        
        setNetworkType(networkState.type);
        setIsConnected(networkState.isConnected);
        setIsInternetReachable(internetReachable);

        Network.addNetworkStateListener(({ type, isConnected }) => {
          setNetworkType(type);
          setIsConnected(isConnected);
        });
      } catch (error) {
        console.warn('Network monitoring not available:', error);
      }
    };

    setupNetworkMonitoring();
  }, [isPhone]);

  return { networkType, isConnected, isInternetReachable };
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statusCard: {
    marginBottom: 12,
  },
  statusContent: {
    paddingVertical: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
});
