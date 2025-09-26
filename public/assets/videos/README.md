# Theater Seat Preview Videos

This directory contains video previews for different seating zones in the theater.

## Files:
- `vip-seating.mp4` - Video preview from VIP seating area
- `premium-seating.mp4` - Video preview from Premium seating area

## Usage:
These videos are referenced directly in the AuditoriumPreview model and displayed in the SeatPreviewModal component when users click "Preview" for different seat types.

## Fallback:
If a video fails to load, the system falls back to the 360° image viewer using the url360 field.