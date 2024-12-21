import csv
from datetime import datetime, timedelta
import random

# Base metrics for each client type
CLIENT_PATTERNS = {
    # Optical Power Issues
    '26': {'rx_power': -24.5, 'variation': 0.5},
    '51': {'rx_power': -24.5, 'variation': 0.5},
    
    # Device Density Issues - Changed to use device counts instead of total/ratio
    '27': {'devices_24g_range': (9, 12), 'devices_5g_range': (2, 5)},
    '52': {'devices_24g_range': (9, 12), 'devices_5g_range': (2, 5)},
    
    # Performance Issues - Updated ranges
    '28': {
        'cpu_range': (80, 95),
        'memory_range': (80, 95),
        'temp_range': (70, 85)
    },
    '53': {
        'cpu_range': (80, 95),
        'memory_range': (80, 95),
        'temp_range': (70, 85)
    },
    
    # Protocol Issues
    '29': {'protocols': 2},
    '54': {'protocols': 2},
    
    # Massive Events
    '30': {'events': 2},
    '55': {'events': 2}
}

# Define client pairs
CLIENT_PAIRS = {
    '26': '51',
    '27': '52',
    '28': '53',
    '29': '54',
    '30': '55'
}

# Generate 7 days of data
start_date = datetime(2024, 12, 14)
end_date = start_date + timedelta(days=6)

with open('metrics_data_clients_absolute_week.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['id', 'client_id', 'device_id', 'field', 'value', 'created_at', 'updated_at'])
    
    id_counter = 1
    current_date = start_date
    while current_date <= end_date:
        timestamp = current_date.strftime('%Y-%m-%d 14:47:27')
        
        # Generate base metrics once for each pair
        daily_metrics = {}
        
        for client_id in CLIENT_PATTERNS:
            # Skip if this is the second client in a pair
            if client_id in CLIENT_PAIRS.values():
                continue
                
            base_metrics = {
                'cpuUsage': random.uniform(40.0, 50.0),
                'memoryUsage': random.uniform(55.0, 65.0),
                'rxPower': -17.5,
                'temperature': random.uniform(50.0, 60.0),
                'totalConnectedDevices': 10,
                'averageWorstRssi': -60,
                'connectedDevices5gRatio': 65.0,
                'rebootCount': 0,
                'protocolCount': 0,
                'massiveEventCount': 0
            }

            # Apply specific patterns
            pattern = CLIENT_PATTERNS[client_id]
            if client_id in ['26']:  # Only check first client in pair
                base_metrics['rxPower'] = pattern['rx_power'] + random.uniform(-pattern['variation'], pattern['variation'])
            elif client_id in ['27']:  # Modified this section
                devices_24g = random.randint(*pattern['devices_24g_range'])
                devices_5g = random.randint(*pattern['devices_5g_range'])
                total_devices = devices_24g + devices_5g
                ratio_5g = (devices_5g / total_devices) * 100

                base_metrics['totalConnectedDevices'] = total_devices
                base_metrics['connectedDevices5gRatio'] = ratio_5g
            elif client_id in ['28']:
                base_metrics['cpuUsage'] = random.uniform(*pattern['cpu_range'])
                base_metrics['memoryUsage'] = random.uniform(*pattern['memory_range'])
                base_metrics['temperature'] = random.uniform(*pattern['temp_range'])
            elif client_id in ['29']:
                base_metrics['protocolCount'] = pattern['protocols']
            elif client_id in ['30']:
                base_metrics['massiveEventCount'] = pattern['events']

            # Store metrics for both clients in the pair
            daily_metrics[client_id] = base_metrics
            paired_client = CLIENT_PAIRS[client_id]
            daily_metrics[paired_client] = base_metrics.copy()

        # Write metrics for all clients
        for client_id, metrics in daily_metrics.items():
            for field, value in metrics.items():
                writer.writerow([
                    id_counter,
                    client_id,
                    client_id,
                    field,
                    value,
                    timestamp,
                    timestamp
                ])
                id_counter += 1
        
        current_date += timedelta(days=1)