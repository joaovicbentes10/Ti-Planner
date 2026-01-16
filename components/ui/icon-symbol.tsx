// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for IT Task Planner
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "checklist": "checklist",
  "square.grid.2x2": "grid-view",
  "ellipsis": "more-horiz",
  "gearshape.fill": "settings",
  "chart.bar.fill": "bar-chart",
  "calendar": "calendar-today",
  "folder.fill": "folder",
  
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "pencil": "edit",
  "trash": "delete",
  "trash.fill": "delete",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  
  // Task related
  "flag.fill": "flag",
  "tag.fill": "label",
  "clock.fill": "schedule",
  "bell.fill": "notifications",
  "doc.text.fill": "description",
  "paperclip": "attach-file",
  "link": "link",
  
  // Status
  "circle": "radio-button-unchecked",
  "circle.fill": "radio-button-checked",
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  
  // Controls
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "arrow.counterclockwise": "refresh",
  "forward.fill": "skip-next",
  
  // Other
  "magnifyingglass": "search",
  "line.3.horizontal.decrease": "filter-list",
  "square.and.arrow.up": "share",
  "square.and.arrow.down": "download",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || "help-outline";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
