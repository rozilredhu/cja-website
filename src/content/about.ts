/**
 * About CJA — factual copy only.
 * Sources: cjacanada.com (About / Vision / Mission), Corporations Canada
 * corporation #4385632 via federalcorporation.ca. Do not invent dates.
 */

export const aboutContent = {
  /** Short lede for the page hero (Canadian English, from mission). */
  lede:
    "The Canadian Jats Association (CJA) brings Jat families together across Canada — welcoming newcomers, celebrating culture, and keeping the next generation connected to their roots.",

  /**
   * Polished Canadian-English About body drawn from cjacanada.com.
   * Grammar and wording cleaned; facts unchanged.
   */
  introParagraphs: [
    "The Canadian Jats Association (CJA) is a not-for-profit organization for the Jat community in Canada. Based in the Greater Toronto Area (Mississauga / Toronto, Ontario), its primary aim is to provide networking and support to newcomers while offering members and their families a common forum to meet, exchange views, and take part in community life.",
    "CJA was formed in 2006 so that members could interact personally and build lasting connections. The association hosts social gatherings and annual gala events, and celebrates festivals including Holi and Diwali. Since its inception, CJA has been a platform to share knowledge among members and to represent the Jat community in Canada.",
    "CJA also creates space for Indo-Canadians with roots in India to share cultural experiences, and works with community partners to foster goodwill between India and Canada. The public website has described an association with the Consulate General of India in Toronto, Panorama, and various Indo-Canadian community organizations.",
  ],

  /**
   * Single-string intro for homepage teasers and other importers
   * (same facts as introParagraphs).
   */
  intro:
    "The Canadian Jats Association (CJA) is a not-for-profit organization for the Jat community in Canada. Based in the Greater Toronto Area (Mississauga / Toronto, Ontario), its primary aim is to provide networking and support to newcomers while offering members and their families a common forum to meet, exchange views, and take part in community life. CJA was formed in 2006 so that members could interact personally and build lasting connections. The association hosts social gatherings and annual gala events, and celebrates festivals including Holi and Diwali. Since its inception, CJA has been a platform to share knowledge among members and to represent the Jat community in Canada. CJA also creates space for Indo-Canadians with roots in India to share cultural experiences, and works with community partners to foster goodwill between India and Canada. The public website has described an association with the Consulate General of India in Toronto, Panorama, and various Indo-Canadian community organizations.",

  /** Mission — from cjacanada.com; lightly edited for Canadian English. */
  mission:
    "The mission of CJA is to unite the Jat community living in Canada and worldwide, while preserving our culture and traditions and passing them on to the next generation — keeping our younger generation connected with our roots.",

  /** Vision — from cjacanada.com; lightly edited for Canadian English. */
  vision:
    "CJA serves the community by sharing knowledge and resources with newcomers from India and other countries, helping them adapt to life in Canada and feel at home within the existing Jat community. With the help of existing members, the association also offers guidance to community members outside Canada who are interested in settling here (for example, student or permanent resident pathways).",

  /**
   * Verified history facts only. LinkedIn lists “founded 2004”; that is not used
   * because it conflicts with the official site and federal incorporation records.
   */
  history: {
    heading: "History & legal status",
    facts: [
      {
        label: "Formed",
        value: "2006",
        detail:
          "CJA was formed in 2006 as a common forum for Jat community members in Canada.",
        source: "cjacanada.com — About CJA",
      },
      {
        label: "Federal incorporation",
        value: "26 September 2006",
        detail:
          "Canadian Jats Association was incorporated federally under the Canada Corporations Act — Part II as corporation number 4385632 (business number 831290325).",
        source: "Corporations Canada / federalcorporation.ca",
      },
      {
        label: "Registered office",
        value: "Mississauga, Ontario",
        detail:
          "2980 Drew Road #230, Mississauga, ON L4T 0A7 (also published as 230-2980 Drew Rd on cjacanada.com).",
        source: "Corporations Canada; cjacanada.com contact panel",
      },
      {
        label: "Membership (as published)",
        value: "Over 400 members",
        detail:
          "The public About copy on cjacanada.com states that CJA has over 400 members and continues to enrol new members. Current live membership figures are not independently verified here.",
        source: "cjacanada.com — About CJA",
      },
    ],
    omittedNote:
      "Exact founding day within 2006 (beyond the federal incorporation date of 26 September 2006), original founding directors, and earlier informal organizing dates are not stated clearly on the public sources reviewed for this page, so they are omitted rather than guessed.",
  },

  /** Themes drawn only from public About / Vision / Mission copy. */
  values: [
    {
      title: "Newcomer support",
      body: "Networking and support for new immigrants, helping them adapt to life in Canada and connect with the existing Jat community.",
    },
    {
      title: "Culture & traditions",
      body: "Preserving culture and traditions and passing them on to the next generation, including celebrations such as Holi and Diwali.",
    },
    {
      title: "Knowledge & community image",
      body: "A forum to meet, exchange views, share knowledge, and project the image of the Jat community in Canada.",
    },
    {
      title: "India–Canada goodwill",
      body: "Working with partners such as the Consulate General of India (Toronto), Panorama, and Indo-Canadian community organizations to foster goodwill between India and Canada.",
    },
  ],

  whatWeDo: [
    "Provide networking and support to newcomers in Canada.",
    "Offer networking through social gatherings and annual gala events.",
    "Host social celebrations including Holi and Diwali festivals.",
    "Share knowledge among members and welcome new members.",
    "Offer peer guidance, via existing members, to community members abroad who are interested in settling in Canada.",
  ],

  /** Contact / next steps (not history claims). */
  note: "About, vision, and mission are based on the public copy on cjacanada.com, lightly edited for Canadian English. Leadership details are listed on the Officials page.",
};
