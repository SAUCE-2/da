import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function CodeBlock({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="code-block"
      className={cn(
        "relative flex min-h-70 flex-col overflow-hidden rounded-md border bg-background text-foreground",
        className
      )}
      style={
        {
          "--code-block-font":
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          "--code-block-font-size": "0.875rem",
          "--code-block-line-height": "1.55",
          "--code-block-line-height-size": "1.35625rem",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

function CodeBlockGutter({
  className,
  style,
  gutterWidthCh = 2,
  ...props
}: React.ComponentProps<"div"> & { gutterWidthCh?: number }) {
  return (
    <div
      data-slot="code-block-gutter"
      className={cn(
        "sticky left-0 z-1 flex shrink-0 flex-col border-r border-border bg-background py-3 select-none",
        className
      )}
      style={{
        fontFamily: "var(--code-block-font)",
        fontSize: "var(--code-block-font-size)",
        lineHeight: "var(--code-block-line-height)",
        minWidth: `calc(${gutterWidthCh}ch + 1.5rem)`,
        ...style,
      }}
      {...props}
    />
  )
}

const codeBlockLineNumberVariants = cva(
  "flex items-center justify-end pr-3 pl-2 tabular-nums",
  {
    variants: {
      state: {
        on: "text-muted-foreground",
        off: "text-muted-foreground/40",
        indeterminate: "text-muted-foreground",
      },
      clickable: {
        true: "cursor-pointer hover:bg-muted hover:text-foreground",
        false: "",
      },
    },
    defaultVariants: {
      state: "on",
      clickable: false,
    },
  }
)

function CodeBlockLineNumber({
  className,
  state = "on",
  onClick,
  style,
  ...props
}: Omit<React.ComponentProps<"button">, "type"> &
  VariantProps<typeof codeBlockLineNumberVariants>) {
  const clickable = Boolean(onClick)
  const classes = cn(
    codeBlockLineNumberVariants({
      state,
      clickable,
    }),
    className
  )
  const mergedStyle = {
    height: "var(--code-block-line-height-size)",
    ...style,
  }

  if (clickable) {
    return (
      <button
        type="button"
        data-slot="code-block-line-number"
        className={classes}
        style={mergedStyle}
        onClick={onClick}
        {...props}
      />
    )
  }

  return (
    <span
      data-slot="code-block-line-number"
      className={classes}
      style={mergedStyle}
      {...(props as React.ComponentProps<"span">)}
    />
  )
}

function CodeBlockContent({
  className,
  style,
  ...props
}: React.ComponentProps<"pre">) {
  return (
    <pre
      data-slot="code-block-content"
      className={cn(
        "m-0 overflow-visible bg-transparent px-3 whitespace-pre",
        className
      )}
      style={{
        fontFamily: "var(--code-block-font)",
        fontSize: "var(--code-block-font-size)",
        lineHeight: "var(--code-block-line-height)",
        ...style,
      }}
      {...props}
    />
  )
}

const codeBlockLineVariants = cva("min-h-(--code-block-line-height-size)", {
  variants: {
    disabled: {
      true: "text-muted-foreground/50 line-through opacity-45 **:text-inherit",
      false: "",
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

function CodeBlockLine({
  className,
  disabled = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof codeBlockLineVariants>) {
  return (
    <div
      data-slot="code-block-line"
      className={cn(codeBlockLineVariants({ disabled }), className)}
      {...props}
    />
  )
}

function CodeBlockInput({
  className,
  style,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="code-block-input"
      spellCheck={false}
      wrap="off"
      className={cn(
        "absolute inset-0 size-full resize-none border-0 bg-transparent px-3 py-3 text-transparent caret-foreground outline-none selection:bg-primary/30",
        className
      )}
      style={{
        fontFamily: "var(--code-block-font)",
        fontSize: "var(--code-block-font-size)",
        lineHeight: "var(--code-block-line-height)",
        whiteSpace: "pre",
        overflow: "hidden",
        ...style,
      }}
      {...props}
    />
  )
}

function CodeBlockCopyButton({
  value,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  value: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable; ignore.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      data-slot="code-block-copy-button"
      className={cn("absolute top-2 right-2 z-10", className)}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy"}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

export {
  CodeBlock,
  CodeBlockGutter,
  CodeBlockLineNumber,
  CodeBlockContent,
  CodeBlockLine,
  CodeBlockInput,
  CodeBlockCopyButton,
}
