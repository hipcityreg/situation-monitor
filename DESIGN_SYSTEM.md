# Aegis UI Design System

A comprehensive design guide for the tactical command interface. Reference this document when creating new components, features, tabs, or UI elements.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Layout Patterns](#layout-patterns)
6. [Border & Rounding](#border--rounding)
7. [Effects & Visual Treatments](#effects--visual-treatments)
8. [Interactive States](#interactive-states)
9. [Core Components](#core-components)
10. [UI Patterns](#ui-patterns)
11. [Iconography](#iconography)
12. [Z-Index & Layering](#z-index--layering)
13. [Code Reference](#code-reference)

---

## Design Philosophy

Aegis UI follows a **tactical military interface** aesthetic with these core principles:

- **Dark-first**: Near-black backgrounds with high-contrast elements
- **Glass morphism**: Semi-transparent panels with backdrop blur
- **Tech aesthetics**: Corner decorations, grid patterns, scan lines
- **Information density**: Compact text, monospace for data
- **Semantic color coding**: Immediate visual threat assessment
- **Layered depth**: 3D globe background with floating UI panels

---

## Color Palette

### Background Colors

| Token                 | Value          | Usage                         |
| --------------------- | -------------- | ----------------------------- |
| `bg-app`              | `#050505`      | Main application background   |
| `bg-globe`            | `#020305`      | Globe/3D scene background     |
| `bg-panel`            | `slate-950/80` | Primary panel background      |
| `bg-surface`          | `slate-900`    | Secondary surfaces, headers   |
| `bg-surface-alt`      | `slate-900/80` | Input backgrounds             |
| `bg-surface-elevated` | `slate-900/95` | Alert overlays                |
| `bg-surface-subtle`   | `slate-900/50` | Timeline background           |
| `bg-card`             | `slate-800/40` | Card backgrounds              |
| `bg-interactive`      | `slate-800/50` | Buttons, interactive elements |
| `bg-container`        | `slate-800`    | Containers, minimaps          |
| `bg-deep`             | `black`        | Deep backgrounds (feeds)      |

```tsx
// Example usage
<div className="bg-slate-950/80 backdrop-blur-md">  // Panel
<div className="bg-slate-800/40">                    // Card
<div className="bg-slate-900">                       // Header
```

### Primary Accent (Cyan)

The primary brand color for active states, emphasis, and interactive elements.

| Token              | Value                    | Usage                     |
| ------------------ | ------------------------ | ------------------------- |
| `accent-solid`     | `cyan-600`               | Logo, primary buttons     |
| `accent-text`      | `cyan-400`               | Active text, links        |
| `accent-border`    | `cyan-500/50`            | Tech corners, decorations |
| `accent-hover`     | `cyan-500`               | Hover borders             |
| `accent-glow`      | `shadow-[0_0_10px_cyan]` | Status indicators         |
| `accent-selection` | `cyan-900`               | Text selection            |
| `accent-hex`       | `#06b6d4`                | Globe points              |

```tsx
// Example usage
<div className="text-cyan-400">                           // Active text
<div className="border-cyan-500/50">                      // Tech corner
<div className="bg-cyan-500 shadow-[0_0_10px_cyan]">     // Glowing dot
```

### Semantic Colors

#### Critical (Red) - Threats, failures, urgent alerts

| Token             | Value        | Usage            |
| ----------------- | ------------ | ---------------- |
| `critical-bg`     | `red-950/50` | Badge background |
| `critical-text`   | `red-500`    | Badge text       |
| `critical-border` | `red-800/50` | Badge border     |
| `critical-hex`    | `#ef4444`    | Globe arcs/rings |

#### Warning (Amber) - Caution, pending, detection

| Token                   | Value                                    | Usage                        |
| ----------------------- | ---------------------------------------- | ---------------------------- |
| `warning-bg`            | `amber-950/50`                           | Badge background             |
| `warning-text`          | `amber-500`                              | Badge text, detection labels |
| `warning-border`        | `amber-800/50`                           | Badge border                 |
| `warning-box`           | `amber-500/80`                           | Detection bounding box       |
| `warning-box-uncertain` | `amber-500/40`                           | Uncertain detection (dashed) |
| `warning-glow`          | `shadow-[0_0_15px_rgba(245,158,11,0.5)]` | Warning glow                 |

#### Success (Emerald) - Confirmed, completed, safe

| Token            | Value            | Usage            |
| ---------------- | ---------------- | ---------------- |
| `success-bg`     | `emerald-950/50` | Badge background |
| `success-text`   | `emerald-500`    | Badge text       |
| `success-border` | `emerald-800/50` | Badge border     |

#### Neutral (Slate) - Default, inactive, secondary

| Token            | Value          | Usage            |
| ---------------- | -------------- | ---------------- |
| `neutral-bg`     | `slate-800/50` | Badge background |
| `neutral-text`   | `slate-400`    | Badge text       |
| `neutral-border` | `slate-700/50` | Badge border     |

```tsx
// Badge variant examples
const variants = {
	critical: 'bg-red-950/50 text-red-500 border-red-800/50',
	warning: 'bg-amber-950/50 text-amber-500 border-amber-800/50',
	success: 'bg-emerald-950/50 text-emerald-500 border-emerald-800/50',
	neutral: 'bg-slate-800/50 text-slate-400 border-slate-700/50'
};
```

### Text Colors

| Token            | Value       | Usage                     |
| ---------------- | ----------- | ------------------------- |
| `text-primary`   | `white`     | Headings, important text  |
| `text-base`      | `slate-200` | Default body text         |
| `text-secondary` | `slate-300` | Secondary body text       |
| `text-tertiary`  | `slate-400` | Metadata, labels          |
| `text-muted`     | `slate-500` | Icons, placeholders       |
| `text-disabled`  | `slate-600` | Disabled elements         |
| `text-inverse`   | `black`     | Text on light backgrounds |

```tsx
// Text hierarchy
<h1 className="text-white">Primary heading</h1>
<p className="text-slate-200">Body text</p>
<span className="text-slate-400">Metadata</span>
<span className="text-slate-500">Muted</span>
```

### Border Colors

| Token            | Value          | Usage                |
| ---------------- | -------------- | -------------------- |
| `border-panel`   | `slate-700/50` | Panel borders        |
| `border-default` | `slate-700`    | Standard borders     |
| `border-subtle`  | `slate-700/30` | Grid lines           |
| `border-strong`  | `slate-600`    | Card borders, inputs |
| `border-divider` | `slate-800`    | Section dividers     |

---

## Typography

### Font Families

| Token | Class       | Usage                                |
| ----- | ----------- | ------------------------------------ |
| Sans  | `font-sans` | Primary UI text (Geist Sans)         |
| Mono  | `font-mono` | Data, codes, timestamps, coordinates |

**Rule**: Use `font-mono` for:

- Coordinates & measurements
- Status codes & IDs
- Timestamps
- Technical data
- Detection confidence percentages

```tsx
<span className="font-mono">NR9051</span>           // Call sign
<span className="font-mono">BRN-290 (89%)</span>    // Detection
<span className="font-mono">Range: 370 miles</span> // Data
```

### Font Sizes

| Token        | Class         | Pixel | Usage                        |
| ------------ | ------------- | ----- | ---------------------------- |
| `text-lg`    | `text-lg`     | 18px  | Panel titles, major headings |
| `text-sm`    | `text-sm`     | 14px  | Section headings, nav        |
| `text-xs`    | `text-xs`     | 12px  | Body text, labels, buttons   |
| `text-micro` | `text-[10px]` | 10px  | Metadata, badges, captions   |
| `text-nano`  | `text-[9px]`  | 9px   | Detection labels, markers    |

```tsx
// Size hierarchy example
<h2 className="text-lg font-bold text-white">Panel Title</h2>
<h3 className="text-sm font-bold text-white">Section Title</h3>
<p className="text-xs text-slate-300">Body content</p>
<span className="text-[10px] text-slate-400">Metadata</span>
```

### Font Weights

| Token  | Class       | Usage                          |
| ------ | ----------- | ------------------------------ |
| Normal | (default)   | Body text                      |
| Bold   | `font-bold` | All headings, labels, emphasis |

**Rule**: Aegis uses `font-bold` for nearly all headings and labels. Normal weight is reserved for body text only.

### Letter Spacing

| Token  | Class             | Usage                        |
| ------ | ----------------- | ---------------------------- |
| Widest | `tracking-widest` | Main titles, section headers |
| Wider  | `tracking-wider`  | Badges                       |
| Wide   | `tracking-wide`   | Alert text                   |

```tsx
<h1 className="text-sm font-bold tracking-widest uppercase">GLOBAL OVERVIEW</h1>
<span className="text-[10px] tracking-wider uppercase">CRITICAL</span>
```

### Text Transform

| Class       | Usage                                           |
| ----------- | ----------------------------------------------- |
| `uppercase` | Badges, section headers, nav labels, alert text |

**Rule**: Most UI labels use `uppercase`. Only body/descriptive text uses normal case.

### Line Height

| Class             | Usage                |
| ----------------- | -------------------- |
| `leading-tight`   | Headings (compact)   |
| `leading-relaxed` | Body text (readable) |

---

## Spacing System

### Padding

| Class           | Value     | Usage                |
| --------------- | --------- | -------------------- |
| `p-4`           | 16px      | Panel default        |
| `p-3`           | 12px      | Cards                |
| `p-2`           | 8px       | Header bars, compact |
| `p-1`           | 4px       | Input containers     |
| `px-6 py-3`     | 24px/12px | Alert overlays       |
| `px-3 py-1`     | 12px/4px  | Buttons              |
| `px-1.5 py-0.5` | 6px/2px   | Badges               |
| `pl-3`          | 12px      | Blockquote indent    |

### Margins

| Class   | Value | Usage                              |
| ------- | ----- | ---------------------------------- |
| `mb-4`  | 16px  | Major sections                     |
| `mb-2`  | 8px   | Minor sections                     |
| `mb-1`  | 4px   | Compact spacing                    |
| `mt-2`  | 8px   | Section content                    |
| `mt-1`  | 4px   | Tight content                      |
| `mx-2`  | 8px   | Horizontal centering               |
| `-mx-2` | -8px  | Full-bleed within padded container |

### Gaps (Flexbox/Grid)

| Class             | Value    | Usage                       |
| ----------------- | -------- | --------------------------- |
| `gap-4`           | 16px     | Grid columns, major spacing |
| `gap-2`           | 8px      | Item lists, button groups   |
| `gap-x-4 gap-y-1` | 16px/4px | Data grids                  |

### Spacing Patterns

```tsx
// Panel with sections
<Panel className="space-y-4">
	{' '}
	// 16px between major sections
	<div className="space-y-2">
		{' '}
		// 8px between items
		<SectionHeader />
		<div className="mt-2 space-y-2">
			{' '}
			// Item list
			<Card />
			<Card />
		</div>
	</div>
</Panel>
```

---

## Layout Patterns

### Grid System

Aegis uses a **12-column grid** for the main layout:

```tsx
<div className="grid grid-cols-12 gap-4">
	<aside className="col-span-3">Left Panel</aside> // 25%
	<main className="col-span-6">Center (Globe)</main> // 50%
	<aside className="col-span-3">Right Panel</aside> // 25%
</div>
```

### Sub-Grids

| Pattern  | Class                          | Usage        |
| -------- | ------------------------------ | ------------ |
| 2-column | `grid grid-cols-2`             | Data pairs   |
| 4x4      | `grid grid-cols-4 grid-rows-4` | Minimap grid |

### Flexbox Patterns

```tsx
// Vertical stack (most common)
<div className="flex flex-col gap-4">

// Horizontal with centering
<div className="flex items-center gap-2">

// Space between
<div className="flex items-center justify-between">

// Top alignment
<div className="flex items-start justify-between">

// Fill available space
<div className="flex-1">
```

### Sizing

| Class               | Usage                           |
| ------------------- | ------------------------------- |
| `w-screen h-screen` | Full viewport                   |
| `w-10 h-10`         | Logo container                  |
| `w-8 h-8`           | Icon button container           |
| `w-2 h-2`           | Corner decorations, status dots |
| `w-1 h-1`           | Micro markers                   |
| `h-12`              | Header height, timeline         |
| `h-32`              | Timeline panel                  |
| `h-2/3`             | 66% height ratio                |
| `w-64`              | Search input                    |
| `w-16 h-12`         | Thumbnails                      |

### Overflow Handling

```tsx
// Scrollable panel
<Panel className="flex-1 overflow-y-auto min-h-0">

// Clipped content
<div className="overflow-hidden">

// Allow flex shrinking
<div className="min-h-0">
```

---

## Border & Rounding

### Border Widths

| Class            | Value      | Usage                                   |
| ---------------- | ---------- | --------------------------------------- |
| `border`         | 1px        | Default borders                         |
| `border-2`       | 2px        | Emphasis, detection boxes, tech corners |
| `border-[0.5px]` | 0.5px      | Subtle grid lines                       |
| `border-b`       | 1px bottom | Section dividers                        |
| `border-l-2`     | 2px left   | Blockquote accent                       |

### Border Styles

| Class           | Usage                            |
| --------------- | -------------------------------- |
| `border-solid`  | Default (confirmed)              |
| `border-dashed` | Uncertain/unconfirmed detections |

### Border Radius

| Class          | Value | Usage                   |
| -------------- | ----- | ----------------------- |
| `rounded-sm`   | 2px   | Buttons, badges, panels |
| `rounded`      | 4px   | Default, inputs         |
| `rounded-full` | 50%   | Circles, avatars        |

**Rule**: Aegis uses minimal rounding. `rounded-sm` is standard. Never use `rounded-lg` or larger.

---

## Effects & Visual Treatments

### Shadows

| Class                                    | Usage                     |
| ---------------------------------------- | ------------------------- |
| `shadow-2xl`                             | Panel elevation           |
| `shadow-[0_0_10px_cyan]`                 | Cyan glow (active status) |
| `shadow-[0_0_15px_rgba(245,158,11,0.5)]` | Amber glow (warning)      |

### Backdrop Blur

```tsx
// Standard panel glass effect
<div className="bg-slate-950/80 backdrop-blur-md">
```

### Opacity Levels

| Value        | Usage                       |
| ------------ | --------------------------- |
| `/80`        | Primary panels, backgrounds |
| `/50`        | Secondary elements, badges  |
| `/40`        | Cards, subtle backgrounds   |
| `/30`        | Overlay patterns            |
| `/20`        | Noise texture, subtle       |
| `opacity-75` | Disabled/failed state       |
| `opacity-60` | Dimmed images               |

### Gradients

```tsx
// Vignette (radial darkening)
<div className="bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)]" />

// Horizontal accent line
<div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

// Diagonal shine
<div className="bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]" />
```

### Filters

| Class         | Usage                      |
| ------------- | -------------------------- |
| `grayscale`   | Inactive/unselected images |
| `grayscale-0` | Active images (on hover)   |

### Texture Overlays

```tsx
// Noise/grain texture
<div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

// Grid pattern
<div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-30" />
```

---

## Interactive States

### Transitions

| Class                         | Usage                        |
| ----------------------------- | ---------------------------- |
| `transition-colors`           | Color/background changes     |
| `transition-all duration-500` | Complex transitions (images) |

### Hover States

```tsx
// Subtle background highlight
<div className="hover:bg-white/5">

// Button hover
<button className="hover:bg-slate-700">

// Text brighten
<span className="hover:text-white">

// Accent text
<span className="hover:text-cyan-400">

// Border accent
<div className="hover:border-cyan-500">

// Image activation
<img className="grayscale hover:grayscale-0">
```

### Group Interactions

```tsx
// Parent defines group, children respond
<div className="group cursor-pointer">
	<span className="group-hover:text-cyan-400">Text changes on parent hover</span>
</div>
```

### Cursor

```tsx
// All interactive elements
<div className="cursor-pointer">
```

---

## Core Components

### Panel

The primary container component with glass morphism and tech decorations.

```tsx
const Panel = ({
	children,
	className,
	noPadding = false
}: {
	children: React.ReactNode;
	className?: string;
	noPadding?: boolean;
}) => (
	<div
		className={cn(
			'bg-slate-950/80 backdrop-blur-md border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col',
			'relative isolate',
			!noPadding && 'p-4',
			className
		)}
	>
		{/* Tech Decoration Corners */}
		<div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50" />
		<div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50" />
		<div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50" />
		<div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50" />
		{children}
	</div>
);
```

**Usage:**

```tsx
<Panel>Default with padding</Panel>
<Panel noPadding>Custom internal layout</Panel>
<Panel className="flex-1 overflow-y-auto">Scrollable</Panel>
```

### Badge

Status indicator with semantic variants.

```tsx
const Badge = ({
	children,
	variant = 'neutral'
}: {
	children: React.ReactNode;
	variant?: 'critical' | 'warning' | 'success' | 'neutral';
}) => {
	const variants = {
		critical: 'bg-red-950/50 text-red-500 border-red-800/50',
		warning: 'bg-amber-950/50 text-amber-500 border-amber-800/50',
		success: 'bg-emerald-950/50 text-emerald-500 border-emerald-800/50',
		neutral: 'bg-slate-800/50 text-slate-400 border-slate-700/50'
	};
	return (
		<span
			className={cn(
				'px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm',
				variants[variant]
			)}
		>
			{children}
		</span>
	);
};
```

**Usage:**

```tsx
<Badge variant="critical">CRITICAL</Badge>
<Badge variant="warning">16 HRS</Badge>
<Badge variant="success">CONFIRMED</Badge>
<Badge>PENDING</Badge>
```

### SectionHeader

Collapsible section header with active/inactive states.

```tsx
const SectionHeader = ({ title, active = true }: { title: string; active?: boolean }) => (
	<div
		className={cn(
			'flex items-center justify-between py-2 border-b border-slate-800 cursor-pointer hover:bg-white/5 transition-colors px-2 -mx-2',
			active ? 'text-cyan-400' : 'text-slate-400'
		)}
	>
		<span className="text-xs font-bold uppercase tracking-widest">{title}</span>
		{active ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
	</div>
);
```

**Usage:**

```tsx
<SectionHeader title="Intelligence" active={false} />
<SectionHeader title="Response Plans" active={true} />
```

---

## UI Patterns

### Card Pattern

Interactive card for lists of items.

```tsx
<div className="p-3 bg-slate-800/40 border border-slate-600 hover:border-cyan-500 transition-colors cursor-pointer group">
	<div className="flex justify-between items-center mb-1">
		<span className="text-xs font-bold text-white group-hover:text-cyan-400">Card Title</span>
		<Badge variant="warning">STATUS</Badge>
	</div>
	<div className="flex justify-between text-[10px] text-slate-400 font-mono">
		<span>Left metadata</span>
		<span>Right metadata</span>
	</div>
</div>
```

### Status Dot (Glowing)

```tsx
<div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan]" />
```

### Blockquote/Highlighted Text

```tsx
<div className="text-xs text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">
	Important contextual information or summary.
</div>
```

### Keyboard Shortcut Badge

```tsx
<span className="text-[10px] text-slate-600 border border-slate-700 px-1 rounded">CTRL+K</span>
```

### Vertical Divider

```tsx
<div className="h-8 w-[1px] bg-slate-700 mx-2" />
```

### Accent Line (Horizontal)

```tsx
<div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
```

### Floating Label (Map Marker)

```tsx
<div className="flex items-center gap-2">
	<div className="w-8 h-8 rounded-full border border-cyan-500/50 bg-slate-900/80 flex items-center justify-center">
		<Plane size={14} className="text-cyan-400" />
	</div>
	<div className="flex flex-col">
		<span className="text-[10px] font-mono text-cyan-400">NR9051</span>
		<span className="text-[10px] font-mono text-white">C-130 Transport</span>
	</div>
</div>
```

### Detection Bounding Box

```tsx
// Confirmed detection
<div className="absolute w-24 h-16 border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
  <div className="absolute -top-5 left-0 bg-amber-500/90 text-black text-[9px] px-1 font-bold font-mono">
    BRN-290 (89%)
  </div>
  {/* Corner markers */}
  <div className="absolute top-0 left-0 w-1 h-1 bg-amber-500" />
  <div className="absolute bottom-0 right-0 w-1 h-1 bg-amber-500" />
</div>

// Uncertain detection
<div className="absolute w-20 h-20 border-2 border-amber-500/40 border-dashed">
  <div className="absolute -bottom-5 right-0 text-amber-500 text-[9px] font-bold font-mono">
    TL412 Radar
  </div>
</div>
```

### Search Input

```tsx
<div className="flex items-center gap-2 bg-slate-900/80 p-1 border border-slate-700 rounded-sm w-64">
	<Search size={14} className="text-slate-500 ml-2" />
	<input
		type="text"
		placeholder="Search operations..."
		className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
	/>
	<span className="text-[10px] text-slate-600 border border-slate-700 px-1 rounded">CTRL+K</span>
</div>
```

### Navigation Button (Active)

```tsx
<button className="px-3 py-1 text-xs bg-slate-800/50 border border-slate-600 rounded-sm hover:bg-slate-700 text-cyan-400 flex items-center gap-2">
	<AlertTriangle size={12} /> Situations
</button>
```

### Navigation Button (Inactive)

```tsx
<button className="px-3 py-1 text-xs text-slate-400 hover:text-white flex items-center gap-2">
	<Activity size={12} /> Ops
</button>
```

### Header Bar (Panel Sub-header)

```tsx
<div className="bg-slate-900 p-2 flex justify-between items-center border-b border-slate-700">
	<div className="flex items-center gap-2 text-amber-500">
		<AlertTriangle size={14} />
		<span className="text-xs font-bold uppercase">Alert Title</span>
	</div>
	<X size={14} className="text-slate-500 cursor-pointer" />
</div>
```

### Data Grid

```tsx
<div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
	<div className="text-[10px] text-slate-400 font-mono">
		Range: <span className="text-white">370 miles</span>
	</div>
	<div className="text-[10px] text-slate-400 font-mono">
		Weapon: <span className="text-white">2x TNP-05</span>
	</div>
</div>
```

### Timeline Marker

```tsx
<div className="absolute left-[30%] top-0 bottom-0 w-[1px] bg-white z-10 flex flex-col items-center">
	<div className="mt-1 px-1 bg-white text-black text-[9px] font-bold">Now</div>
	<div className="mt-auto mb-1 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white" />
</div>
```

### Alert Overlay

```tsx
<div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-600 px-6 py-3 flex flex-col items-center shadow-2xl z-20 w-1/3">
	<div className="text-xs text-white text-center font-bold tracking-wide">
		ALERT MESSAGE TEXT HERE
	</div>
	<div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2" />
</div>
```

### Minimap Grid

```tsx
<div className="flex-1 w-full bg-slate-800 rounded border border-slate-700 relative overflow-hidden">
	<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.1)_50%,transparent_75%)]" />
	<div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
		{[...Array(16)].map((_, i) => (
			<div key={i} className="border-[0.5px] border-slate-700/30" />
		))}
	</div>
</div>
```

---

## Iconography

### Icon Library

Aegis uses **Lucide React** for all icons.

### Icon Sizes

| Size | Usage                  |
| ---- | ---------------------- |
| `24` | Logo, primary actions  |
| `14` | Standard UI icons      |
| `12` | Inline with small text |

### Icon Colors

```tsx
<ShieldAlert className="text-white" size={24} />      // Primary
<AlertTriangle className="text-amber-500" size={14} /> // Warning
<Plane className="text-cyan-400" size={14} />          // Accent
<Search className="text-slate-500" size={14} />        // Muted
<X className="text-slate-500 cursor-pointer" size={14} /> // Interactive muted
```

### Common Icons

| Icon            | Import            | Usage           |
| --------------- | ----------------- | --------------- |
| `ShieldAlert`   | Brand/logo        | Header          |
| `AlertTriangle` | Warnings, alerts  | Badges, headers |
| `Activity`      | Operations        | Navigation      |
| `Plane`         | Aircraft          | Map markers     |
| `Search`        | Search            | Input           |
| `X`             | Close/dismiss     | Dialogs         |
| `ChevronDown`   | Expanded          | Section headers |
| `ChevronRight`  | Collapsed         | Section headers |
| `Maximize2`     | Expand/fullscreen | Panels          |
| `Globe`         | Map/global        | Navigation      |
| `Radio`         | Communications    | Alerts          |
| `Crosshair`     | Targeting         | Tactical        |

---

## Z-Index & Layering

| Layer      | Z-Index | Content                |
| ---------- | ------- | ---------------------- |
| Globe      | `z-0`   | 3D globe background    |
| UI Overlay | `z-10`  | Panels, navigation     |
| Alerts     | `z-20`  | Modal overlays, toasts |

### Pointer Events

```tsx
// Container that passes clicks through to globe
<div className="absolute inset-0 z-10 pointer-events-none">
	// Interactive element within
	<div className="pointer-events-auto">Clickable content</div>
</div>
```

### Stacking Context

```tsx
// Create isolated stacking context
<div className="relative isolate">
```

---

## Code Reference

### Utility Function

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

### Dynamic Import (SSR-safe)

```tsx
const GlobeGL = dynamic(() => import('react-globe.gl'), { ssr: false });
```

### Responsive Dimensions

```tsx
const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

useEffect(() => {
	setDimensions({ width: window.innerWidth, height: window.innerHeight });
	const handleResize = () =>
		setDimensions({ width: window.innerWidth, height: window.innerHeight });
	window.addEventListener('resize', handleResize);
	return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Root Container

```tsx
<div className="relative w-screen h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans selection:bg-cyan-900 selection:text-white">
```

---

## Quick Reference Checklist

When creating new components, verify:

- [ ] Background uses slate-950/80 or slate-900 family
- [ ] Text uses proper hierarchy (white > slate-200 > slate-400 > slate-500)
- [ ] Borders use slate-700/50 or slate-600
- [ ] Interactive elements have hover states
- [ ] Semantic colors match meaning (red=critical, amber=warning, emerald=success)
- [ ] Monospace font for data/technical content
- [ ] Uppercase + tracking for labels/headers
- [ ] Text sizes follow scale (lg, sm, xs, [10px], [9px])
- [ ] Rounded-sm (not rounded-lg)
- [ ] Icons sized appropriately (24, 14, 12)
- [ ] Transitions on interactive elements
- [ ] Proper z-index layer
- [ ] Pointer-events handled for overlay panels
