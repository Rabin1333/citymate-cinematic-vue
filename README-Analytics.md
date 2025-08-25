# Analytics Dashboard - Implementation Notes

## Overview
This implementation provides a comprehensive analytics dashboard for the cinema admin area with complete mock data services and a clean architecture for switching to real APIs in Iteration 2.

## Features Implemented

### 📊 KPI Grid
- **9 Key Performance Indicators**: Tickets Sold, Seats Booked, Unique Customers, Gross Revenue, Net Revenue, Cancellations, Refunds, Average Ticket Price, Average Occupancy Rate
- **Visual Trends**: Mock trend indicators showing percentage changes from previous periods
- **Loading States**: Skeleton loaders for all KPI cards
- **Error Handling**: Graceful error display with retry options

### 🎯 Filters & Controls
- **Date Range**: Quick presets (7/30/90 days) + custom date picker
- **Granularity**: Day/Week/Month switching for time series data
- **Movie Selection**: Multi-select filter with visual badges
- **Export Options**: CSV export for Bookings, Revenue, and Utilization data

### 📈 Charts (Using Recharts)
- **Time Series Line Chart**: Dual-axis chart showing tickets sold and revenue over time
- **Top Movies Bar Chart**: Horizontal bar chart with toggleable metrics (tickets vs revenue)
- **Interactive Features**: Tooltips, legends, responsive design
- **Dark Theme Integration**: Charts match the cinema dark theme

### 📋 Data Tables
- **Showtimes Performance**: Sortable table with pagination showing date, time, movie, screen, occupancy, revenue
- **Recent Activity**: Timeline view of bookings, refunds, cancellations with status badges
- **Utilization Overview**: Screen-by-screen performance with progress bars and occupancy percentages
- **Responsive Design**: Tables adapt to mobile screens

### 💾 CSV Export
- **Client-side Generation**: Three export types (Bookings, Revenue, Utilization)
- **Proper Formatting**: Currency formatting, date formatting, percentage values
- **Download Naming**: Automatically named files with date ranges
- **Progress Indicators**: Loading states during export generation

## Architecture

### 🔧 Data Services (`src/services/analytics.ts`)
```typescript
// Environment flag for data source switching
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

// All service functions support both mock and HTTP modes
export const analyticsService = {
  getOverviewStats(filters: AnalyticsFilters): Promise<OverviewStats>
  getMovieStats(filters: AnalyticsFilters): Promise<MovieStats[]>
  // ... other methods
}
```

### 🎨 Component Structure
- `AnalyticsFilters.tsx` - Filter controls and export functionality
- `KPIGrid.tsx` - KPI cards with loading/error states
- `AnalyticsCharts.tsx` - Time series and movie performance charts
- `AnalyticsTables.tsx` - All data tables with sorting and pagination
- `Analytics.tsx` - Main page component orchestrating everything

### 🔄 State Management
- **React Query**: Caching, background refetching, error handling
- **Local State**: Filter state, pagination, sorting
- **Optimistic Updates**: Immediate UI updates when filters change

## Mock Data Implementation

### 📊 Realistic Data Generation
- **Time-based Variation**: Data varies based on selected date ranges
- **Correlation Logic**: Related metrics move together (e.g., higher ticket sales = higher revenue)
- **Seasonal Patterns**: Weekend vs weekday variations, time-of-day patterns
- **Error Simulation**: 10% chance of mock API "failures" to test error handling

### 🎭 Movie Integration
- **Aligned with Existing Data**: Uses the same movie titles from the main movie list
- **Consistent Naming**: Movie IDs and titles match the admin movies page
- **Performance Variations**: Different movies show realistic performance variations

## Environment Configuration

### 🔧 Current Setup (Mock Mode)
```bash
# Default behavior - uses mocks
VITE_USE_MOCKS=true  # or undefined
```

### 🌐 Future Production Setup (Iteration 2)
```bash
# Switch to real APIs
VITE_USE_MOCKS=false
```

## Planned HTTP Endpoints (Iteration 2)

All mock service methods are already designed to match these future endpoints:

```
GET /api/admin/stats/overview?from={date}&to={date}
GET /api/admin/stats/by-movie?from={date}&to={date}&limit={number}
GET /api/admin/stats/by-showtime?movieId={id}&from={date}&to={date}
GET /api/admin/stats/timeseries?granularity={day|week|month}&from={date}&to={date}
GET /api/admin/stats/recent-activity?limit={number}
GET /api/admin/stats/utilization?from={date}&to={date}
GET /api/admin/stats/export.csv?from={date}&to={date}&type={bookings|revenue|utilization}
```

## Usage Instructions

### 🚀 Running with Mocks (Current)
1. Navigate to `/admin/analytics`
2. All data is generated client-side with realistic variations
3. Filters immediately update all charts and tables
4. CSV export works fully with mock data

### 🔄 Switching to Production (Iteration 2)
1. Set `VITE_USE_MOCKS=false` in environment
2. Implement the HTTP endpoints listed above
3. No frontend code changes required - services automatically switch
4. All data contracts are already defined and ready

## Performance Considerations
- **Query Caching**: 5-minute cache for most analytics data
- **Background Refetching**: Data stays fresh without blocking UI
- **Pagination**: Large tables are paginated to maintain performance
- **Lazy Loading**: Charts only render when data is available

## Error Handling
- **Network Errors**: Graceful fallbacks with retry options
- **Data Validation**: Type-safe data contracts prevent runtime errors
- **User Feedback**: Toast notifications for export success/failure
- **Loading States**: Comprehensive skeleton loaders for all components

This implementation provides a production-ready analytics dashboard that can seamlessly transition from mock data to real backend services with minimal configuration changes.
