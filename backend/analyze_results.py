import json
import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path

def load_json_files(file_path="performance_summary.json"):
    results_data = []
    
    with open(file_path, 'r') as f:
        data = json.load(f)
        for result in data['results']:
            results_data.append({
                'Threads': result['thread_count'],
                'Informs': result['inform_count'],
                'Total Time (s)': result['metrics']['Total Time (s)']['mean'],
                'Total Time Std': result['metrics']['Total Time (s)']['std'],
                'CPU Usage (%)': result['metrics']['Avg CPU Usage (%)']['mean'],
                'CPU Usage Std': result['metrics']['Avg CPU Usage (%)']['std'],
                'Peak Heap (MB)': result['metrics']['Avg Heap (MB)']['mean'],
                'Peak Heap Std': result['metrics']['Avg Heap (MB)']['std'],
                'RSS Memory (MB)': result['metrics']['Avg RSS (MB)']['mean'],
                'RSS Memory Std': result['metrics']['Avg RSS (MB)']['std']
            })
    
    return pd.DataFrame(results_data)

def process_data(df):
    # No need for grouping since data is already averaged
    return df

def create_analysis_plots(df):
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    colors = {
        '10000': 'r',
        '30000': 'b',
        '50000': 'g'
    }
    
    # Filter out 1000 informs and get valid inform counts
    valid_informs = [count for count in df['Informs'].unique() if count in [10000, 30000, 50000]]
    
    # Plot A: Threads vs Total Time (with log scale)
    for inform_count in valid_informs:
        data = df[df['Informs'] == inform_count]
        axes[0, 0].errorbar(data['Threads'], data['Total Time (s)'],
                          yerr=data['Total Time Std'],
                          marker='o', 
                          label=f'{inform_count} Informs',
                          color=colors[str(inform_count)])
    
    axes[0, 0].set_title('A. Threads vs Tempo Total (s) - Escala Log', fontsize=12)
    axes[0, 0].set_xlabel('Número de Threads', fontsize=10)
    axes[0, 0].set_ylabel('Tempo Total (s) - Log Scale', fontsize=10)
    axes[0, 0].set_yscale('log')  # Set logarithmic scale for y-axis
    axes[0, 0].legend(fontsize=10)
    axes[0, 0].grid(True, which="both")  # Show grid for both major and minor ticks
    axes[0, 0].grid(True, which="minor", alpha=0.2)  # Make minor grid less prominent
    
    # Plot B: CPU Usage
    for inform_count in valid_informs:
        data = df[df['Informs'] == inform_count]
        axes[0, 1].errorbar(data['Threads'], data['CPU Usage (%)'],
                          yerr=data['CPU Usage Std'],
                          marker='o', 
                          label=f'{inform_count} Informs',
                          color=colors[str(inform_count)])
    
    axes[0, 1].set_title('B. Threads vs Uso de CPU (%)', fontsize=12)
    axes[0, 1].set_xlabel('Número de Threads', fontsize=10)
    axes[0, 1].set_ylabel('Uso de CPU (%)', fontsize=10)
    axes[0, 1].legend(fontsize=10)
    axes[0, 1].grid(True)
    
    # Plot C: Peak Heap Memory
    for inform_count in valid_informs:
        data = df[df['Informs'] == inform_count]
        axes[1, 0].errorbar(data['Threads'], data['Peak Heap (MB)'],
                          yerr=data['Peak Heap Std'],
                          marker='o', 
                          label=f'{inform_count} Informs',
                          color=colors[str(inform_count)])
    
    axes[1, 0].set_title('C. Threads vs Memória Heap (MB)', fontsize=12)
    axes[1, 0].set_xlabel('Número de Threads', fontsize=10)
    axes[1, 0].set_ylabel('Memória Heap (MB)', fontsize=10)
    axes[1, 0].legend(fontsize=10)
    axes[1, 0].grid(True)
    
    # Plot D: RSS Memory
    for inform_count in valid_informs:
        data = df[df['Informs'] == inform_count]
        axes[1, 1].errorbar(data['Threads'], data['RSS Memory (MB)'],
                          yerr=data['RSS Memory Std'],
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
        'Total Time (s)': 'mean',
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
    print(df)
    
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