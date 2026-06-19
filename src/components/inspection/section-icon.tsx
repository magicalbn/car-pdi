import {
  Car,
  Wrench,
  Armchair,
  Cpu,
  Gauge,
  Package,
  ListChecks,
  ClipboardCheck,
  ClipboardList,
  ScanLine,
  Disc,
  BatteryCharging,
  type LucideIcon,
} from "lucide-react";

// Explicit map (instead of `import * as Icons`) to keep the type-checker light
// and the bundle tree-shakeable.
const ICONS: Record<string, LucideIcon> = {
  Car,
  Wrench,
  Armchair,
  Cpu,
  Gauge,
  Package,
  ListChecks,
  ClipboardCheck,
  ClipboardList,
  ScanLine,
  Disc,
  BatteryCharging,
};

export function SectionIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? ClipboardList;
  return <Icon className={className} />;
}
