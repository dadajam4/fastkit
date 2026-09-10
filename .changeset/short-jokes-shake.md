---
'@fastkit/vui-wysiwyg': patch
---

Stop registering `underline` and `link` twice on tiptap 3.

tiptap 3 moved `Underline` and `Link` into `StarterKit`, so both were registered
a second time by `WysiwygFormatUnderlineTool` / `WysiwygLinkTool`. tiptap logged
`Duplicate extension names found: ['underline']` and silently kept only one of
the two registrations — dropping the options object passed to the tool when the
tool's registration was the one discarded.

Both are now disabled in `StarterKit.configure`, matching what was already done
for `bold`, `bulletList`, `italic`, `orderedList` and `undoRedo`: the tool is the
single source for the extension, and the tool is what carries the user's options.

Migration: `underline` and `link` are no longer enabled implicitly. This restores
the behaviour of the tiptap 2 era, where `StarterKit` shipped neither. If an
editor relied on `StarterKit` providing them without registering the matching
tool, `<u>` and `<a>` are now stripped when content is loaded. Add
`WysiwygFormatUnderlineTool` / `WysiwygLinkTool` to the editor's tools, or
register the extension explicitly through the `extensions` prop.
