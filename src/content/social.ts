/**
 * Social embed placeholders. Replace handles/URLs when CJA confirms accounts.
 * Instagram: DO NOT build (handoff §3B).
 */
export const socialEmbeds = {
  x: {
    label: "X (Twitter)",
    handlePlaceholder: "@CJACanada (sample)",
    /** Timeline embed script src placeholder — empty until handle confirmed */
    profileUrl: "",
    note: "X timeline embed will appear here once CJA confirms the official handle.",
  },
  facebook: {
    label: "Facebook Page",
    pageUrl: "",
    note: "Facebook Page Plugin placeholder. Paste the official Page URL to enable the embed.",
  },
  youtube: {
    label: "YouTube",
    channelUrl: "",
    /** Sample embed for layout; replace with CJA channel video */
    sampleEmbedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    note: "YouTube channel embed / featured video placeholder.",
  },
};
