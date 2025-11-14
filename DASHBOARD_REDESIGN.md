# Analytics Dashboard Redesign

## Overview
The analytics dashboard has been completely redesigned to match the reference layout you provided, with a modern, multi-card layout that displays various analytics metrics and visualizations.

## Data Available from Tracking Script

The tracking script (embedded in the `<head>` tag of client websites) collects the following data:

### Core Tracking Data
- **Session ID**: Unique identifier for each user session (`session_id`)
- **Page URL**: Full URL of the page being tracked (`page_url`)
- **Page Title**: HTML title of the page (`page_title`)
- **Referrer**: HTTP referrer (how the user got to the page) (`referrer`)
- **User Agent**: Browser and device information (`user_agent`)
- **Event Type**: Type of event (pageview, click, custom) (`event_type`)
- **Timestamp**: When the event occurred (`timestamp`)
- **IP Hash**: Anonymized IP address (`ip_hash`)
- **Custom Properties**: Any additional properties sent with the event (`properties`)

### Derived Metrics
From the raw tracking data, we can calculate:
- **Total Pageviews**: Count of all pageview events
- **Unique Sessions**: Distinct session IDs
- **Total Events**: Count of all events
- **Top Pages**: Pages ranked by view count
- **Daily Traffic**: Events aggregated by date
- **Traffic Sources**: Referrers ranked by frequency
- **Browser Distribution**: Breakdown by browser type
- **Events per Session**: Average engagement metric

## Dashboard Layout

### 1. Header Section
- Dashboard title and description
- Date range selector (7, 30, 90 days)
- CSV export button

### 2. Main Metrics Grid (3-column, responsive)
Three key metric cards with:
- **Metric Value** (large number)
- **Percentage Change** (compared to previous period)
- **Description** (Lorem ipsum placeholder)
- **Icon** with color-coded background

Cards include:
- Total Pageviews (Blue)
- Unique Sessions (Orange)
- Total Events (Purple)

### 3. Charts Section (2-column layout)

#### Left Column (2/3 width) - "Dolor sit amet" Chart
- Vertical bar chart showing daily traffic
- Blue gradient bars
- Date labels
- Legend with Lorem/Ipsum categories

#### Right Column (1/3 width) - "Consectetur" Distribution
- Pie/donut chart visualization
- Shows percentage distribution of metrics
- Breakdown of sessions, pageviews, and other events
- Subscribe button

### 4. Data Tables & Mini Charts Section

#### Left Column (2/3 width) - "Dolor sit amet" (Top Pages)
- Search functionality to filter pages
- Numbered list of pages
- View counts
- Hover effects

#### Right Column (1/3 width) - "Commodity" Stats
- Mini bar chart
- Summary statistics

### 5. Bottom Stats Row (3-column grid)

#### "Delerit augue" Card
- Multi-color progress bar (Purple, Blue, Orange)
- Legend with three categories
- Proportional width representation

#### "Consectetur" Card
- Donut chart (30/70 split)
- Donut chart visualization using SVG

#### "Commodities" Card
- Horizontal bar chart
- Orange gradient bars

## Components Used

### UI Components from library:
- `Card`: Container for all sections
- `Button`: Export and action buttons
- `Input`: Search field for pages

### Icons from lucide-react:
- `Eye`: Pageviews metric
- `Users`: Sessions metric
- `Activity`: Events metric / Loading state
- `TrendingUp`: Trending indicator
- `Download`: Export button
- `ArrowUp`: Percentage change indicator
- `Search`: Search input icon

### Charts Implementation
Charts are built using:
- SVG elements for pie/donut charts
- CSS gradients for bar charts
- Tailwind CSS for styling
- Simple array mapping for data visualization

## Data Flow

```
Tracking Script (in <head>)
    ↓
Event Sent to /track endpoint
    ↓
Stored in MongoDB (events collection)
    ↓
Dashboard fetches /analytics/{project_id}/overview
    ↓
Backend aggregates data for specified date range
    ↓
Returns:
  - total_pageviews
  - unique_sessions
  - total_events
  - top_pages: [{url, views}, ...]
  - daily_traffic: [{date, count}, ...]
    ↓
React component renders visualizations
```

## Features

1. **Responsive Design**: Grid layout adapts from 1 column (mobile) to 3 columns (desktop)
2. **Date Range Selection**: Filter data for 7, 30, or 90-day periods
3. **Search Functionality**: Filter top pages by URL
4. **CSV Export**: Download detailed analytics report
5. **Real-time Loading State**: Shows spinner while fetching data
6. **Error Handling**: Toast notifications for failures
7. **Multiple Visualizations**: Mix of bars, pies, and metrics cards

## Styling

- **Color Palette**: 
  - Primary: Purple (#7c3aed)
  - Secondary: Orange (#f97316), Blue (#3b82f6)
  - Background: Light slate (#f1f5f9)
  - Text: Dark slate (#1e293b)

- **Typography**:
  - Headings: Bold, large sizes (3xl, 2xl, lg)
  - Body: Medium weight for labels
  - Values: Bold for emphasis

- **Spacing**: Consistent use of Tailwind spacing (gap-6, p-6, mb-6, etc.)

## Future Enhancements

1. **Custom Date Ranges**: Date picker for specific date ranges
2. **More Chart Types**: Line charts with multiple data series
3. **Browser/Device Breakdown**: Detailed technology stack
4. **Conversion Funnel**: Multi-step user journey tracking
5. **Custom Events**: Track domain-specific events
6. **Anomaly Detection**: Alert on unusual traffic patterns
7. **Comparison**: Compare periods side-by-side
8. **Real-time Dashboard**: Live updates using WebSockets

## Testing

The dashboard includes data-testid attributes for testing:
- `analytics-dashboard`: Main container
- `metric-pageviews`: Pageviews card
- `metric-sessions`: Sessions card (in old version)
- `metric-events`: Events card (in old version)
- `date-range-selector`: Date selector dropdown
- `export-csv-button`: Export button
- `top-pages-card`: Top pages section (in old version)
- `daily-traffic-card`: Daily traffic chart (in old version)

## Notes

- Lorem ipsum text in the dashboard is a placeholder and should be replaced with actual labels
- Percentage changes (12%, 8%, 15%) are hardcoded and should be calculated dynamically
- Charts use simplified SVG/CSS implementations and could be enhanced with a charting library like Recharts or Chart.js
- All data is calculated server-side for performance
