#!/usr/bin/env python3
"""Generate progress visualization charts for EnergyRetro-KGR."""

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
plt.rcParams['font.family'] = ['SimHei', 'DejaVu Sans']  # Chinese font support

OUTPUT_DIR = "/home/b1ggersnow/autoslide/content/260407-EnergyRetro-KGR/assets"

# Chart 1: Graph Statistics
def create_graph_stats_chart():
    nodes = {
        'ReactionRecord': 2418465,
        'Compound': 2022086,
        'Enzyme': 7826,
        'Pathway': 3315,
    }
    relationships = {
        'CONSUMES': 10207237,
        'PRODUCES': 2548612,
        'CATALYZED_BY': 36949,
        'PARTICIPATES_IN_PATHWAY': 44500,
    }

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

    # Nodes chart
    colors1 = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12']
    bars1 = ax1.bar(nodes.keys(), nodes.values(), color=colors1)
    ax1.set_title('Graph Nodes (4.45M total)', fontsize=14)
    ax1.set_ylabel('Count', fontsize=12)
    ax1.tick_params(axis='x', rotation=15)
    for bar, val in zip(bars1, nodes.values()):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 50000,
                 f'{val//1000}K', ha='center', va='bottom', fontsize=10)

    # Relationships chart
    colors2 = ['#9b59b6', '#1abc9c', '#e67e22', '#34495e']
    bars2 = ax2.bar(relationships.keys(), relationships.values(), color=colors2)
    ax2.set_title('Graph Relationships (12.84M total)', fontsize=14)
    ax2.set_ylabel('Count', fontsize=12)
    ax2.tick_params(axis='x', rotation=15)
    for bar, val in zip(bars2, relationships.values()):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 200000,
                 f'{val//1000}K', ha='center', va='bottom', fontsize=10)

    plt.tight_layout()
    plt.savefig(f'{OUTPUT_DIR}/graph_stats.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: graph_stats.png")

# Chart 2: Retrieval Quality
def create_retrieval_chart():
    methods = ['Exact Match', 'Staged Lookup']
    hits = [16, 100]
    colors = ['#e74c3c', '#2ecc71']

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(methods, hits, color=colors, width=0.5)
    ax.set_title('Retrieval Quality: Exact vs Staged', fontsize=14)
    ax.set_ylabel('Hits', fontsize=12)
    ax.set_ylim(0, 120)

    for bar, val in zip(bars, hits):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 3,
                 str(val), ha='center', va='bottom', fontsize=12, fontweight='bold')

    # Add gain annotation
    ax.annotate('', xy=(1, 100), xytext=(0, 16),
                arrowprops=dict(arrowstyle='->', color='#3498db', lw=2))
    ax.text(0.5, 60, '5.25x gain', ha='center', fontsize=12, color='#3498db', fontweight='bold')

    plt.tight_layout()
    plt.savefig(f'{OUTPUT_DIR}/retrieval_quality.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: retrieval_quality.png")

# Chart 3: Module Status
def create_module_status_chart():
    modules = [
        'build_graph.py',
        'query_filters.py',
        'query_runner.py',
        'retrieval.py',
        'molecule_features.py',
        'backfill_compounds.py',
        'report_*.py',
    ]
    status = [100, 100, 100, 100, 100, 100, 100]

    fig, ax = plt.subplots(figsize=(10, 5))
    colors = ['#2ecc71'] * 7  # All green for completed
    bars = ax.barh(modules, status, color=colors, height=0.6)
    ax.set_title('kg Module Completion Status', fontsize=14)
    ax.set_xlabel('Completion %', fontsize=12)
    ax.set_xlim(0, 110)

    for bar, val in zip(bars, status):
        ax.text(bar.get_width() + 2, bar.get_y() + bar.get_height()/2,
                 f'{val}%', ha='left', va='center', fontsize=11)

    plt.tight_layout()
    plt.savefig(f'{OUTPUT_DIR}/module_status.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: module_status.png")

# Chart 4: Housekeeping Filter Effect
def create_housekeeping_chart():
    stages = ['Before Filter', 'After Filter']
    rates = [25, 0]
    colors = ['#e74c3c', '#2ecc71']

    fig, ax = plt.subplots(figsize=(6, 5))
    bars = ax.bar(stages, rates, color=colors, width=0.4)
    ax.set_title('Housekeeping Compound Filter Effect', fontsize=14)
    ax.set_ylabel('Housekeeping Rate (%)', fontsize=12)
    ax.set_ylim(0, 35)

    for bar, val in zip(bars, rates):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                 f'{val}%', ha='center', va='bottom', fontsize=12, fontweight='bold')

    plt.tight_layout()
    plt.savefig(f'{OUTPUT_DIR}/housekeeping_filter.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: housekeeping_filter.png")

if __name__ == '__main__':
    create_graph_stats_chart()
    create_retrieval_chart()
    create_module_status_chart()
    create_housekeeping_chart()
    print("All charts generated successfully!")