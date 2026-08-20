import type { Dict } from "./i18n/types";
import type { CartLine } from "./cart";
import { getAccessory, getModel } from "./products";

/** Cart line → the name and subtitle it should show in the current language. */
export function describeLine(line: CartLine, t: Dict): { name: string; subtitle: string } {
  const finish = t.finishes[line.finishId].name;
  if (line.kind === "accessory" && line.accessoryId) {
    const accessory = getAccessory(line.accessoryId);
    return {
      name: `AUREL ${accessory.name}`,
      subtitle: `${t.accessories[line.accessoryId].title} · ${finish}`,
    };
  }
  return { name: `AUREL ${getModel(line.modelId ?? "arc").name}`, subtitle: finish };
}
