"use client";

import * as React from "react";
import katex from "katex";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";

function MathNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const latex = (node.attrs.latex as string) || "";
  const html = React.useMemo(() => {
    try {
      return katex.renderToString(latex || "\\text{math}", { throwOnError: false, displayMode: false });
    } catch {
      return latex;
    }
  }, [latex]);

  function edit() {
    const next = window.prompt("LaTeX source (e.g. x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a})", latex);
    if (next != null) updateAttributes({ latex: next });
  }

  return (
    <NodeViewWrapper as="span" className={`inline-math ${selected ? "ring-2 ring-[var(--color-signal)]" : ""}`}>
      <span
        onClick={edit}
        className="mx-0.5 cursor-pointer rounded px-1 py-0.5 hover:bg-surface-2"
        contentEditable={false}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </NodeViewWrapper>
  );
}

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-math-inline]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-math-inline": "true" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },
});
