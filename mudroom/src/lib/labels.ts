import {
  extraIsIncluded,
  getConfiguration,
  getExtra,
  getInstall,
  getShell,
  type BoxSpec,
} from "./products";

export interface LineDescription {
  title: string;
  subtitle: string;
  /** Everything the buyer chose, as short readable chips. */
  details: string[];
}

export function describeSpec(spec: BoxSpec): LineDescription {
  const config = getConfiguration(spec.config);
  const extras = spec.extras.filter((id) => !extraIsIncluded(id, spec.config));
  return {
    title: `MUDROOM ${config.name}`,
    subtitle: config.strap,
    details: [
      getShell(spec.shell).name,
      getInstall(spec.install).name,
      spec.warrantyExtension && spec.config === "core" ? "5-year warranty" : `${config.id === "core" ? 3 : 5}-year warranty`,
      ...extras.map((id) => getExtra(id).name),
    ],
  };
}
