import DOMPurify from "isomorphic-dompurify";

/**
 * Whitelist-only sanitizer for CMS-authored HTML (Storyblok rich-text).
 *
 * Defends against stored XSS if the Storyblok account or rich-text renderer is abused
 * to inject `<script>`, inline event handlers, `javascript:` URLs, `<iframe>`, etc.
 *
 * The allow-list below matches the tag/attr set that Storyblok's rich-text renderer
 * actually emits for our legal pages (offer, privacy, payment-refund). Add tags here
 * only if a legitimate CMS block needs them.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class", "id", "title", "colspan", "rowspan"];

const ALLOWED_URI_REGEXP = /^(https?:|mailto:|tel:|\/)/i;

export function sanitizeCmsHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["style", "srcset"],
    ALLOW_DATA_ATTR: false,
  });
}
