import matplotlib.pyplot as plt

# Dados
threads = [1, 2, 4, 8, 16]
informs_per_second_100 = [126.9, 105.26, 140.45, 104.28, 73.05]
informs_per_second_1000 = [102.43, 162, 213.13, 168.18, 142.13]
informs_per_second_10000 = [79.15, 138.01, 204.79, 180.09, 163.57]

cpu_usage_100 = [64, 122, 158, 374, 686]
cpu_usage_1000 = [689, 570, 596, 1122, 1611]
cpu_usage_10000 = [5244, 5726, 5109, 6592, 7905]

peak_heap_100 = [41.46, 591.92, 647.98, 638.23, 659.44]
peak_heap_1000 = [138.32, 703.43, 733.87, 741.31, 728.61]
peak_heap_10000 = [615.79, 761.98, 772.84, 766.79, 752.97]

rss_memory_100 = [228.17, 1633.92, 1940.02, 2210.36, 2172.25]
rss_memory_1000 = [391.34, 1265.16, 2284.11, 1981, 2061.17]
rss_memory_10000 = [1464.52, 1718.92, 1827.38, 1516.81, 2652.31]

# Criando o layout 2x2
fig, axs = plt.subplots(2, 2, figsize=(15, 12))

# Gráfico A: Threads vs Informs/segundo
axs[0, 0].plot(threads, informs_per_second_100, marker='o', label='100 Informs', color='b')
axs[0, 0].plot(threads, informs_per_second_1000, marker='o', label='1000 Informs', color='g')
axs[0, 0].plot(threads, informs_per_second_10000, marker='o', label='10000 Informs', color='r')
axs[0, 0].set_title('A. Threads vs Taxa de Informs/Segundo', fontsize=12)
axs[0, 0].set_xlabel('Número de Threads', fontsize=10)
axs[0, 0].set_ylabel('Taxa de Informs/Segundo', fontsize=10)
axs[0, 0].legend(fontsize=10)
axs[0, 0].grid(True)

# Gráfico B: Threads vs Uso de CPU
axs[0, 1].plot(threads, cpu_usage_100, marker='o', label='100 Informs', color='b')
axs[0, 1].plot(threads, cpu_usage_1000, marker='o', label='1000 Informs', color='g')
axs[0, 1].plot(threads, cpu_usage_10000, marker='o', label='10000 Informs', color='r')
axs[0, 1].set_title('B. Threads vs Uso de CPU (%)', fontsize=12)
axs[0, 1].set_xlabel('Número de Threads', fontsize=10)
axs[0, 1].set_ylabel('Uso de CPU (%)', fontsize=10)
axs[0, 1].legend(fontsize=10)
axs[0, 1].grid(True)

# Gráfico C: Threads vs Memória Peak Heap
axs[1, 0].plot(threads, peak_heap_100, marker='o', label='100 Informs', color='b')
axs[1, 0].plot(threads, peak_heap_1000, marker='o', label='1000 Informs', color='g')
axs[1, 0].plot(threads, peak_heap_10000, marker='o', label='10000 Informs', color='r')
axs[1, 0].set_title('C. Threads vs Memória Heap (MB)', fontsize=12)
axs[1, 0].set_xlabel('Número de Threads', fontsize=10)
axs[1, 0].set_ylabel('Memória Heap (MB)', fontsize=10)
axs[1, 0].legend(fontsize=10)
axs[1, 0].grid(True)

# Gráfico D: Threads vs Memória RSS
axs[1, 1].plot(threads, rss_memory_100, marker='o', label='100 Informs', color='b')
axs[1, 1].plot(threads, rss_memory_1000, marker='o', label='1000 Informs', color='g')
axs[1, 1].plot(threads, rss_memory_10000, marker='o', label='10000 Informs', color='r')
axs[1, 1].set_title('D. Threads vs Memória RSS (MB)', fontsize=12)
axs[1, 1].set_xlabel('Número de Threads', fontsize=10)
axs[1, 1].set_ylabel('Memória RSS (MB)', fontsize=10)
axs[1, 1].legend(fontsize=10)
axs[1, 1].grid(True)

# Ajustando o layout para evitar sobreposição
plt.tight_layout()

# Exibindo os gráficos
plt.show()