import json
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

def load_json_files(pattern="*t_*.json"):
    results_data = []
    
    # Get all json files matching the pattern
    json_files = Path('.').glob(pattern)
    
    for file_path in json_files:
        with open(file_path, 'r') as f:
            data = json.load(f)
            for result in data['results']:
                results_data.append({
                    'Threads': result['Threads'],
                    'Informs': result['Informs'],
                    'Total Time (ms)': result['Total Time (ms)'],
                    'Informs/second': result['Informs/second'],
                    'CPU Usage (%)': result['CPU Usage (%)'],
                    'Peak Heap (MB)': result['Peak Heap (MB)'],
                    'RSS Memory (MB)': result['RSS Memory (MB)']
                })
    
    return pd.DataFrame(results_data)

def process_data(df):
    # Agrupa por Threads e Informs e calcula a média de todas as métricas
    grouped_df = df.groupby(['Threads', 'Informs']).agg({
        'Total Time (ms)': 'mean',
        'Informs/second': 'mean',
        'CPU Usage (%)': 'mean',
        'Peak Heap (MB)': 'mean',
        'RSS Memory (MB)': 'mean'
    }).reset_index()
    
    return grouped_df

def create_analysis_plots(df):
    # Create a figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # Define colors for consistency
    colors = {'100': 'b', '1000': 'g', '10000': 'r'}
    
    # Plot A: Threads vs Informs/second
    for inform_count in df['Informs'].unique():
        data = df[df['Informs'] == inform_count]
        axes[0, 0].plot(data['Threads'], data['Informs/second'], 
                       marker='o', 
                       label=f'{inform_count} Informs',
                       color=colors[str(inform_count)])
    
    axes[0, 0].set_title('A. Threads vs Taxa de Informs/Segundo', fontsize=12)
    axes[0, 0].set_xlabel('Número de Threads', fontsize=10)
    axes[0, 0].set_ylabel('Taxa de Informs/Segundo', fontsize=10)
    axes[0, 0].legend(fontsize=10)
    axes[0, 0].grid(True)
    
    # Plot B: CPU Usage
    for inform_count in df['Informs'].unique():
        data = df[df['Informs'] == inform_count]
        axes[0, 1].plot(data['Threads'], data['CPU Usage (%)'], 
                       marker='o', 
                       label=f'{inform_count} Informs',
                       color=colors[str(inform_count)])
    
    axes[0, 1].set_title('B. Threads vs Uso de CPU (%)', fontsize=12)
    axes[0, 1].set_xlabel('Número de Threads', fontsize=10)
    axes[0, 1].set_ylabel('Uso de CPU (%)', fontsize=10)
    axes[0, 1].legend(fontsize=10)
    axes[0, 1].grid(True)
    
    # Plot C: Peak Heap Memory
    for inform_count in df['Informs'].unique():
        data = df[df['Informs'] == inform_count]
        axes[1, 0].plot(data['Threads'], data['Peak Heap (MB)'], 
                       marker='o', 
                       label=f'{inform_count} Informs',
                       color=colors[str(inform_count)])
    
    axes[1, 0].set_title('C. Threads vs Memória Heap (MB)', fontsize=12)
    axes[1, 0].set_xlabel('Número de Threads', fontsize=10)
    axes[1, 0].set_ylabel('Memória Heap (MB)', fontsize=10)
    axes[1, 0].legend(fontsize=10)
    axes[1, 0].grid(True)
    
    # Plot D: RSS Memory
    for inform_count in df['Informs'].unique():
        data = df[df['Informs'] == inform_count]
        axes[1, 1].plot(data['Threads'], data['RSS Memory (MB)'], 
                       marker='o', 
                       label=f'{inform_count} Informs',
                       color=colors[str(inform_count)])
    
    axes[1, 1].set_title('D. Threads vs Memória RSS (MB)', fontsize=12)
    axes[1, 1].set_xlabel('Número de Threads', fontsize=10)
    axes[1, 1].set_ylabel('Memória RSS (MB)', fontsize=10)
    axes[1, 1].legend(fontsize=10)
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig('performance_analysis.png', dpi=300, bbox_inches='tight')
    plt.close()

def generate_summary_table(df):
    # Group by Threads and Informs, then calculate mean values
    summary = df.groupby(['Threads', 'Informs']).agg({
        'Informs/second': 'mean',
        'CPU Usage (%)': 'mean',
        'Peak Heap (MB)': 'mean',
        'RSS Memory (MB)': 'mean'
    }).round(2)
    
    # Save to CSV
    summary.to_csv('performance_summary.csv')
    return summary

def main():
    # Load and process data
    df = load_json_files()
    
    # Process data to get averages across test runs
    processed_df = process_data(df)
    
    # Create visualizations with processed data
    create_analysis_plots(processed_df)
    
    # Generate summary table with processed data
    summary = generate_summary_table(processed_df)
    print("\nPerformance Summary (Averaged across test runs):")
    print(summary)

if __name__ == "__main__":
    main() 