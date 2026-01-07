# Financial Visualization System

## Overview
This directory contains all visualization components for the financial advisor system. Visualizations are standardized into specific types that the backend generates, and the frontend renders using these modular components.

## Supported Visualization Types

### 📊 Charts (`./charts/`)
- `line` - Line chart for trends over time
- `area` - Area chart (filled line chart)
- `bar` - Simple bar chart
- `stacked_bar` - Stacked bar chart for comparisons
- `grouped_bar` - Grouped bar chart for multiple series
- `pie` - Pie chart for proportions
- `donut` - Donut chart (pie with center hole)
- `scatter` - Scatter plot (future)

### 📋 Tables (`./tables/`)
- `comparison_table` - Side-by-side comparison table
- `action_table` - Action plan with steps, timeline, priority
- `timeline_table` - Events/milestones in table format
- `goal_summary_table` - Goals overview table

### 🎯 Scenarios (`./scenarios/`)
- `scenario_comparison` - Multiple what-if scenarios side-by-side (best/base/worst case)

### 📌 Boards (`./boards/`)
- `milestone_board` - Kanban-style board with milestones
- `action_cards` - Card grid layout for actions
- `risk_matrix` - 2x2 or 3x3 grid showing risks

### 📝 Notes (`./notes/`)
- `insight_note` - Key insights/takeaways
- `warning_note` - Warnings/alerts
- `tip_note` - Tips/suggestions
- `summary_note` - Summary/recap

### 📅 Timelines (`./timelines/`)
- `timeline_horizontal` - Horizontal timeline with events
- `timeline_vertical` - Vertical timeline (future)

## Data Structure

All visualizations receive a `VisualizationData` object:

```typescript
interface VisualizationData {
  type: string;  // e.g., 'line', 'pie', 'comparison_table'
  title?: string;
  description?: string;  // Explanation of what this shows (replaces agent text)
  
  // For Charts
  points?: Array<{ label?: string; value?: number; hover?: string; x?: any; y?: any }>;
  x_axis?: string;
  y_axis?: string;
  
  // For Tables
  columns?: string[];
  rows?: Array<Record<string, any>>;
  
  // For Scenarios
  scenarios?: Array<{ name: string; outcome: string; probability?: string; data?: any[] }>;
  
  // For Boards/Cards
  items?: Array<Record<string, any>>;
  
  // For Notes
  note_type?: 'info' | 'success' | 'warning' | 'error';
  content?: string;
  
  // Universal
  summary?: string;  // Key insight (shows in footer)
  metadata?: Record<string, any>;  // Custom data
}
```

## Component Architecture

```
VisualizationRenderer.tsx (main entry point)
├── charts/
│   ├── BaseChart.tsx (shared utilities)
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   ├── PieChart.tsx
│   ├── DonutChart.tsx
│   ├── AreaChart.tsx
│   ├── StackedBarChart.tsx
│   └── GroupedBarChart.tsx
├── tables/
│   ├── ComparisonTable.tsx
│   ├── ActionTable.tsx
│   └── TimelineTable.tsx
├── scenarios/
│   └── ScenarioComparison.tsx
├── boards/
│   ├── MilestoneBoard.tsx
│   ├── ActionCards.tsx
│   └── RiskMatrix.tsx
├── notes/
│   └── NoteCard.tsx
└── timelines/
    └── TimelineHorizontal.tsx
```

## Usage

The main component `VisualizationRenderer` automatically routes to the correct visualization based on the `type` field:

```tsx
import VisualizationRenderer from './visualizations/VisualizationRenderer';

<VisualizationRenderer data={visualizationData} />
```

## Backend Integration

The backend (`VisualizationSpec` schema in `workflow_schemas.py`) generates these visualizations with:
1. **Standardized types** - Only approved types from the list above
2. **Self-explanatory** - `description` field explains what the viz shows
3. **Complete data** - All required fields for rendering

Agents are instructed to NOT explain visualizations in their text response - all explanations go in the `description` field.

## Implementation Status

### ✅ Complete
- Base structure and routing
- Chart utilities and base setup
- VisualizationRenderer main component

### 🚧 TODO
Create individual components for each type:
1. All chart types (Line, Bar, Pie, Donut, Area, Stacked, Grouped)
2. All table types
3. Scenario comparison
4. All board types
5. Note cards
6. Timelines

Each component should:
- Accept `VisualizationData` prop
- Render with modern, accessible design
- Handle edge cases (no data, invalid data)
- Use Tailwind CSS for styling
- Be responsive
- Include smooth animations where appropriate

## Design Guidelines

- **Modern**: Clean, minimal, professional
- **Accessible**: ARIA labels, keyboard navigation
- **Responsive**: Mobile-first, works on all screens
- **Consistent**: Use CHART_COLORS from BaseChart
- **Animated**: Smooth transitions, but not distracting
- **Informative**: Show data clearly, easy to understand

## Color Palette

```typescript
CHART_COLORS = [
  '#2563eb',  // blue
  '#16a34a',  // green
  '#f59e0b',  // amber
  '#ef4444',  // red
  '#8b5cf6',  // purple
  '#ec4899',  // pink
  '#14b8a6',  // teal
  '#f97316',  // orange
]
```

##Performance Considerations

- Use `useMemo` for expensive calculations
- Lazy load heavy components if needed
- Optimize SVG rendering for charts
- Avoid re-renders on hover/interaction

## Testing

Each component should have:
- Unit tests for data parsing
- Visual regression tests
- Accessibility tests
- Edge case handling tests


