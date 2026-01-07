# Simplified Visualization System

## ✅ Final Approach (Simplified)

After review, we've simplified the visualization system:

### **Charts** → SVG Components (React)
For numerical/visual data that needs custom rendering:
- `line`, `bar`, `pie`, `donut`, `area`, `stacked_bar`, `grouped_bar`, `scatter`

### **Everything Else** → Markdown/HTML
For structured content that doesn't need custom visualization:
- Tables, scenarios, boards, notes, timelines → **Markdown** or **HTML**

## Backend Schema (Python)

```python
class VisualizationSpec(BaseModel):
    type: str  # 'line', 'bar', 'pie', 'donut', 'area', 'stacked_bar', 'grouped_bar', 'scatter', 'table', 'scenario', 'board', 'note', 'timeline', 'content'
    title: Optional[str]
    description: Optional[str]
    
    # For CHARTS
    points: Optional[List[DataPoint]]
    x_axis: Optional[str]
    y_axis: Optional[str]
    
    # For NON-CHART CONTENT
    markdown_content: Optional[str]
    html_content: Optional[str]
    
    summary: Optional[str]
```

## Agent Instructions

### Charts (use `points`)
```json
{
  "type": "donut",
  "title": "Goal Priority Distribution",
  "points": [
    {"label": "High Priority", "value": 3, "hover": "Emergency Fund, Insurance, Debt"},
    {"label": "Medium Priority", "value": 2, "hover": "House, Car"}
  ],
  "summary": "3 high-priority goals requiring immediate attention"
}
```

### Tables (use `markdown_content`)
```json
{
  "type": "table",
  "title": "Your Financial Goals",
  "markdown_content": "| Goal | Timeline | Priority | Status |\n|------|----------|----------|--------|\n| Emergency Fund | 6 months | High | 🟡 In Progress |\n| House Deposit | 5 years | High | 🔴 Not Started |\n\n**Legend:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete",
  "summary": "2 goals identified - both high priority"
}
```

### Scenarios (use `markdown_content`)
```json
{
  "type": "table",
  "title": "What-If Scenarios",
  "markdown_content": "| Scenario | Monthly | Outcome (5yr) | Probability |\n|----------|---------|---------------|-------------|\n| 🟢 Best | $1,500 | $110K | Possible |\n| 🟡 Base | $1,250 | $100K | Likely |\n| 🔴 Worst | $1,000 | $75K | Possible |\n\n**Recommendation:** Plan for base case, adjust if needed.",
  "summary": "Base case most likely - $1,250/month"
}
```

### Notes (use `markdown_content`)
```json
{
  "type": "note",
  "title": "💡 Key Insights",
  "markdown_content": "**Strengths:**\n- Solid income\n- Good savings habit\n\n**Opportunities:**\n- Emergency fund needs boost\n- Consider personal insurance\n\n**Quick Win:** Redirect $X to high-priority goal",
  "summary": "3 strengths, 3 opportunities, 1 quick win"
}
```

### Boards (use `markdown_content`)
```json
{
  "type": "note",
  "title": "🎯 Milestones",
  "markdown_content": "**Month 1-3:** 🏁 Foundation\n- Open HISA\n- First $5K saved\n\n**Month 4-12:** 📈 Momentum\n- $20K saved\n- Habits established\n\n**Check-in:** Every 3 months",
  "summary": "4 milestone phases with quarterly reviews"
}
```

## Frontend Implementation

### Dependencies
```bash
npm install react-markdown remark-gfm
```

### VisualizationRenderer Component

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function VisualizationRenderer({ data }: { data: VisualizationData }) {
  const isChartType = ['line', 'bar', 'pie', 'donut', 'area', 'stacked_bar', 'grouped_bar', 'scatter']
    .includes(data.type?.toLowerCase() || '');

  if (isChartType) {
    // Render chart component (use existing VisualizationCard charts)
    return <ChartComponent data={data} />;
  }

  // Render markdown/HTML for everything else
  if (data.markdown_content) {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for tables, lists, etc.
        }}
      >
        {data.markdown_content}
      </ReactMarkdown>
    );
  }

  if (data.html_content) {
    return <div dangerouslySetInnerHTML={{ __html: data.html_content }} />;
  }

  return <div>No content</div>;
}
```

## Markdown Formatting Guide

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Lists
```markdown
**Numbered:**
1. First item
2. Second item
3. Third item

**Bullets:**
- Item one
- Item two
- Item three
```

### Headers
```markdown
## Large Header
### Medium Header
**Bold Text**
*Italic Text*
```

### Emoji
```markdown
🔴 High Risk
🟡 Medium Risk
🟢 Low Risk

✅ Complete
⚪ Not Started
🟡 In Progress
```

### Inline Formatting
```markdown
**Bold**, *italic*, `code`, [link](url)
```

## Benefits of Simplified Approach

1. **Less Frontend Code**: No need to build 20+ custom components
2. **Flexible Content**: Agents can format content any way they want
3. **Consistent Styling**: Markdown renderer handles styling
4. **Easy Updates**: Change content format without code changes
5. **Accessibility**: Markdown is semantic and screen-reader friendly
6. **Performance**: Markdown rendering is lightweight
7. **Maintainability**: One renderer for all non-chart content

## Implementation Checklist

### Backend ✅
- [x] Update VisualizationSpec schema
- [x] Update Goal Strategy agent prompt
- [x] Update Deep Dive agent prompt
- [x] Validate syntax

### Frontend 
- [ ] Install react-markdown and remark-gfm
- [ ] Integrate existing chart components
- [ ] Style markdown output with Tailwind
- [ ] Test with backend data
- [ ] Handle edge cases (no content, invalid markdown)

## Example Output

When agent generates:
```json
{
  "type": "table",
  "title": "Action Plan",
  "markdown_content": "| # | Action | Timeline |\n|---|--------|----------|\n| 1 | Open HISA | This week |\n| 2 | Auto-transfer | This week |\n| 3 | Budget review | Month 1 |",
  "summary": "3 immediate actions"
}
```

Frontend renders as:
```
┌─────────────────────────────────────┐
│ Action Plan                         │
├─────────────────────────────────────┤
│ # │ Action        │ Timeline        │
├───┼───────────────┼─────────────────┤
│ 1 │ Open HISA     │ This week       │
│ 2 │ Auto-transfer │ This week       │
│ 3 │ Budget review │ Month 1         │
├─────────────────────────────────────┤
│ 💡 3 immediate actions              │
└─────────────────────────────────────┘
```

## Chart Types (Keep Custom)

Only these need custom React components:
1. **Line Chart** - Trends over time
2. **Area Chart** - Filled line chart
3. **Bar Chart** - Simple comparisons
4. **Grouped Bar** - Multiple series
5. **Stacked Bar** - Part-to-whole comparisons
6. **Pie Chart** - Proportions
7. **Donut Chart** - Proportions with center space
8. **Scatter** (future) - Correlations

All others (tables, scenarios, boards, notes, timelines) → **Markdown/HTML**

## Next Steps

1. Install markdown dependencies
2. Wire up existing chart components to VisualizationRenderer
3. Test with agent-generated content
4. Refine markdown styling with Tailwind
5. Handle edge cases
6. Deploy and monitor

## Testing

```typescript
// Test chart
const chartViz = {
  type: 'donut',
  title: 'Test Chart',
  points: [
    { label: 'A', value: 30 },
    { label: 'B', value: 70 }
  ]
};

// Test markdown
const markdownViz = {
  type: 'table',
  title: 'Test Table',
  markdown_content: '| Col1 | Col2 |\n|------|------|\n| A | B |'
};

<VisualizationRenderer data={chartViz} />
<VisualizationRenderer data={markdownViz} />
```

Done! ✅


