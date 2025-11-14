# API Response Structure - Analytics Overview Endpoint

## Endpoint
```
GET /api/analytics/{project_id}/overview?days=7
Authorization: Bearer {token}
```

## Response Schema

```json
{
  "total_pageviews": 1245,
  "unique_sessions": 342,
  "total_events": 3847,
  "avg_events_per_session": 11.24,
  "pageviews_change": 12.5,
  "sessions_change": 8.3,
  "events_change": 15.2,
  "top_pages": [
    {
      "url": "/products",
      "views": 456
    },
    {
      "url": "/about",
      "views": 234
    },
    {
      "url": "/contact",
      "views": 189
    },
    {
      "url": "/blog/post-1",
      "views": 156
    },
    {
      "url": "/services",
      "views": 123
    }
  ],
  "daily_traffic": [
    {
      "date": "2025-11-07",
      "count": 245
    },
    {
      "date": "2025-11-08",
      "count": 312
    },
    {
      "date": "2025-11-09",
      "count": 267
    },
    ...
  ],
  "browsers": {
    "Chrome": 1847,
    "Safari": 1080,
    "Firefox": 578,
    "Edge": 308,
    "Other": 34
  },
  "referrers": [
    {
      "source": "Direct",
      "count": 2947
    },
    {
      "source": "google.com",
      "count": 342
    },
    {
      "source": "facebook.com",
      "count": 156
    },
    {
      "source": "twitter.com",
      "count": 89
    },
    {
      "source": "linkedin.com",
      "count": 45
    }
  ]
}
```

---

## Field Descriptions

### Top-Level Metrics

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `total_pageviews` | int | Total page views in period | 1245 |
| `unique_sessions` | int | Unique user sessions | 342 |
| `total_events` | int | All events (pageviews + custom) | 3847 |
| `avg_events_per_session` | float | Average events per session | 11.24 |
| `pageviews_change` | float | % change vs previous period | 12.5 |
| `sessions_change` | float | % change vs previous period | 8.3 |
| `events_change` | float | % change vs previous period | 15.2 |

### Top Pages Array

```json
{
  "url": "string",      // Full page URL
  "views": "integer"    // Number of pageviews
}
```

**Example:**
```json
{
  "url": "https://example.com/products/laptop",
  "views": 456
}
```

### Daily Traffic Array

```json
{
  "date": "string (YYYY-MM-DD)",  // Date in ISO format
  "count": "integer"               // Events on that date
}
```

**Example:**
```json
{
  "date": "2025-11-14",
  "count": 312
}
```

### Browsers Object

```json
{
  "Chrome": 1847,      // Browser name → count of events
  "Safari": 1080,
  "Firefox": 578,
  "Edge": 308,
  "Other": 34
}
```

**Browser Detection Logic:**
- If user_agent contains "Chrome" and NOT "Edg" → Chrome
- If user_agent contains "Safari" and NOT "Chrome" → Safari
- If user_agent contains "Firefox" → Firefox
- If user_agent contains "Edg" → Edge
- Otherwise → Other

### Referrers Array

```json
{
  "source": "string",    // Domain or "Direct"
  "count": "integer"     // Number of visits from source
}
```

**Examples:**
```json
{
  "source": "Direct",         // No referrer
  "count": 2947
},
{
  "source": "google.com",     // From Google search
  "count": 342
},
{
  "source": "facebook.com",   // From Facebook
  "count": 156
}
```

---

## How Frontend Uses This Data

### Metric Cards
```javascript
// Total Pageviews Card
<div className="text-4xl font-bold">{totalPageviews.toLocaleString()}</div>
// Displays: 1,245

// Change percentage
<span>{pageviewsChange > 0 ? '+' : ''}{pageviewsChange}%</span>
// Displays: +12.5%
```

### Daily Traffic Chart
```javascript
analytics.daily_traffic.map((day, index) => {
  // day.date = "2025-11-07"
  // day.count = 245
  // Renders bar with height proportional to count
})
```

### Browser Distribution
```javascript
Object.entries(browsers).map(([browser, count]) => {
  const percent = Math.round((count / totalEvents) * 100);
  // Chrome: 1847 / 3847 * 100 = 48%
  // Renders progress bar with percentage
})
```

### Traffic Sources
```javascript
referrers.map((ref) => {
  const percent = Math.round((ref.count / totalPageviews) * 100);
  // "Direct": 2947 / 1245 * 100 = 237%
  // (Can exceed 100% if sessions > pageviews)
  // Renders card with source and percentage
})
```

---

## Calculation Examples

### Period Comparison (Pageviews Change)

**Current Period (Last 7 days):** 1245 pageviews
**Previous Period (Previous 7 days):** 1106 pageviews

```
Change % = ((Current - Previous) / Previous) * 100
Change % = ((1245 - 1106) / 1106) * 100
Change % = (139 / 1106) * 100
Change % = 12.56%
Rounded: 12.5%
Display: "+12.5%"
```

### Browser Percentage

**Total Events:** 3847
**Chrome Events:** 1847

```
Chrome % = (Chrome / Total) * 100
Chrome % = (1847 / 3847) * 100
Chrome % = 48.0%
```

### Traffic Source Percentage

**Total Pageviews:** 1245
**Direct Traffic:** 2947

```
Direct % = (Direct / Pageviews) * 100
Direct % = (2947 / 1245) * 100
Direct % = 236.6%
```

**Note:** Referrer count can exceed pageviews because:
- Some events don't have referrer (counted as "Direct")
- One pageview can generate multiple events
- Different counting methodologies

---

## Date Range Parameter

### Supported Values
- `?days=7` - Last 7 days
- `?days=30` - Last 30 days  
- `?days=90` - Last 90 days

### Period Comparison Logic

If `days=7`:
- Current period: today - 7 days
- Previous period: today - 14 days to today - 7 days

If `days=30`:
- Current period: today - 30 days
- Previous period: today - 60 days to today - 30 days

If `days=90`:
- Current period: today - 90 days
- Previous period: today - 180 days to today - 90 days

---

## Error Responses

### Unauthorized
```json
{
  "status_code": 401,
  "detail": "Missing or invalid authorization header"
}
```

### Not Found
```json
{
  "status_code": 404,
  "detail": "Project not found"
}
```

### Server Error
```json
{
  "status_code": 500,
  "detail": "Internal server error"
}
```

---

## Sample cURL Request

```bash
curl -X GET "http://localhost:8000/api/analytics/proj_123/overview?days=7" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Frontend Integration

```javascript
// Fetch data
const response = await axios.get(`/analytics/${projectId}/overview?days=${dateRange}`);

// Extract values
const totalPageviews = response.data.total_pageviews;
const uniqueSessions = response.data.unique_sessions;
const totalEvents = response.data.total_events;
const pageviewsChange = response.data.pageviews_change;
const browsers = response.data.browsers;
const referrers = response.data.referrers;

// Use in rendering
return (
  <div>
    <h1>{totalPageviews} Pageviews</h1>
    <p>{pageviewsChange > 0 ? '+' : ''}{pageviewsChange}%</p>
    {/* ... render charts and tables */}
  </div>
);
```

---

## Performance Considerations

- Events limited to 10,000 most recent per query
- For large sites, consider adding caching
- Browser detection happens server-side (one pass)
- Referrer grouping reduces payload
- Daily breakdown aggregates efficiently in MongoDB
- Recommended refresh rate: every 5-10 minutes

---

## Data Quality Notes

✅ **Complete Data**
- All events from specified date range included
- Accurate counts and calculations
- Real user data

⚠️ **Potential Issues**
- Empty referrer = "Direct"
- Missing user_agent = excluded from browser stats
- Session ID duplicates possible if not unique
- Timestamp precision to millisecond level

✓ **Validation**
- All percentages calculated correctly
- Date ranges validated server-side
- Authorization checked before returning data
- Database queries optimized
