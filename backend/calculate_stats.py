import json
import numpy as np
import os

def load_and_process_file(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
        
    # Extract metrics from all entries
    metrics = {
        'Total Time (s)': [],
        'Avg Heap (MB)': [],
        'Avg RSS (MB)': [],
        'Avg CPU Usage (%)': []
    }
    
    for entry in data:
        if 'results' in entry and len(entry['results']) > 0:
            result = entry['results'][0]
            metrics['Total Time (s)'].append(result['Total Time (s)'])
            metrics['Avg Heap (MB)'].append(result['Avg Heap (MB)'])
            metrics['Avg RSS (MB)'].append(result['Avg RSS (MB)'])
            metrics['Avg CPU Usage (%)'].append(result['Avg CPU Usage (%)'])
    
    # Calculate statistics
    stats = {}
    for metric, values in metrics.items():
        stats[metric] = {
            'mean': np.mean(values),
            'std': np.std(values)
        }
    
    return stats

def main():
    # Dictionary to store results by thread and inform count
    results = {}
    
    # Process all JSON files in the current directory
    for filename in os.listdir('.'):
        if filename.endswith('informs.json'):
            # Extract thread count and inform count from filename
            thread_count, inform_count = map(int, filename.replace('informs.json', '').split('_'))
            
            # Process file
            stats = load_and_process_file(filename)
            
            # Store results
            key = f"{thread_count}_{inform_count}"
            results[key] = {
                'thread_count': thread_count,
                'inform_count': inform_count,
                'metrics': stats
            }
    
    # Create summary output
    summary = []
    for key, data in sorted(results.items(), key=lambda x: (x[1]['thread_count'], x[1]['inform_count'])):
        summary_entry = {
            'thread_count': data['thread_count'],
            'inform_count': data['inform_count'],
            'metrics': {
                metric: {
                    'mean': values['mean'],
                    'std': values['std']
                }
                for metric, values in data['metrics'].items()
            }
        }
        summary.append(summary_entry)
    
    # Save results to a new JSON file
    with open('performance_summary.json', 'w') as file:
        json.dump({'results': summary}, file, indent=2)
    
    # Print formatted results
    print("\nPerformance Summary by Thread Count and Inform Count:")
    print("-" * 80)
    
    for entry in summary:
        print(f"\nThreads: {entry['thread_count']}, Informs: {entry['inform_count']}")
        print("-" * 40)
        for metric, values in entry['metrics'].items():
            print(f"{metric}:")
            print(f"  Mean: {values['mean']:.2f}")
            print(f"  Std Dev: {values['std']:.2f}")

if __name__ == "__main__":
    main() 