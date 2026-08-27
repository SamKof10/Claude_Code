import * as React from "react";

/**
 * Wraps a chart so it isn't a wall of silence to a screen reader.
 *
 * HIG Charting Data: "In addition to the visual descriptions you display, it's
 * crucial to provide both accessibility labels that describe chart values and
 * components" — and a descriptive summary "doesn't take the place of
 * accessibility labels."
 *
 * So this does two things:
 *  1. Hides the decorative SVG from assistive tech and puts a one-line summary
 *     in its place (the "what should I take away" sentence).
 *  2. Exposes the underlying numbers as a real <table>, visually hidden but
 *     fully navigable — the equivalent of reading the chart.
 */
export function AccessibleChart({
  summary,
  columns,
  rows,
  caption,
  children,
}: {
  /** One sentence naming the takeaway, e.g. "Study time over the last 14 days, 4h 20m total." */
  summary: string;
  /** Column headers for the data table, e.g. ["Day", "Minutes"]. */
  columns: [string, string];
  /** The plotted values, already formatted for reading aloud. */
  rows: { label: string; value: string }[];
  /** Optional visible caption rendered under the chart. */
  caption?: string;
  children: React.ReactNode;
}) {
  const tableId = React.useId();

  return (
    <figure className="m-0">
      {/* The rendered chart is decorative once the table below exists. */}
      <div aria-hidden="true">{children}</div>

      <figcaption className="sr-only" id={tableId}>
        {summary}
      </figcaption>

      <table className="sr-only" aria-labelledby={tableId}>
        <thead>
          <tr>
            <th scope="col">{columns[0]}</th>
            <th scope="col">{columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.label}-${i}`}>
              <th scope="row">{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {caption && <p className="mt-2 t-caption text-ink-3">{caption}</p>}
    </figure>
  );
}
