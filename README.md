# Event Time Table

A web-based event scheduling application that allows users to manage events across multiple venues and time slots.

## Features

- **Weekly View**: Navigate through weeks with Monday as the start day
- **Drag Selection**: Select time slots by dragging across the grid
- **Touch Support**: Works on mobile and tablet devices
- **Multiple Venues**: Schedule events across 5 different venues
- **Clash Detection**: Prevents overlapping events
- **Persistent Storage**: Events are saved to local storage by date
- **15-minute Time Slots**: Fine-grained scheduling from 12:00 AM to 11:45 PM

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Day.js** - Date manipulation
- **Radix UI** - Accessible UI components

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## Usage

1. **Navigate Weeks**: Use the left/right arrow buttons in the header to switch between weeks
2. **Select Date**: Click on a day in the days header to view events for that date
3. **Create Event**:
   - Drag across the grid to select time slots
   - Click "Create Event" button
   - Enter event name and save
4. **View Events**: Events are displayed as colored blocks on the grid
5. **Delete Event**: Click on an event and use the delete button

## Data Storage

Events are stored in browser's localStorage organized by date in the format:

```json
{
  "2025-11-30": [
    {
      "id": "uuid",
      "name": "Event Name",
      "venues": [...],
      "startTime": "ISO date string",
      "endTime": "ISO date string",
      "selection": {...}
    }
  ]
}
```
