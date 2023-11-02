type ContentState = {
    state: "available" | "unavailable" | "notify";
    description: string;
  };
  type DetailContent = {
    nimbus: ContentState;
    excel: ContentState;
    coinstats: ContentState;
    debank: ContentState;
    nansen: ContentState;
  };
  
  type DetailContentPrice = {
    free: ContentState;
    explorer: ContentState;
    alpha: ContentState;
  };
  
  type TippyContent = {
    used: boolean;
    title: string;
    content: string;
  };
  
  interface CompareFeature {
    title?: string;
    content: DetailContent | "";
  }
  
  interface ComparePricing {
    title?: string;
    featureStatus: "main" | "part";
    tippy: TippyContent;
    content: DetailContentPrice | "";
  }

  
  
  export const nimbusPricingData: ComparePricing[] = [
    {
      title: "Monitoring",
      featureStatus: "main",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: "",
    },
    {
      title: "Realtime",
      featureStatus: "part",
      tippy: {
        used: true,
        title: "Get latest market information and real-time market update",
        content: `~/assets/pricing/Realtime.mp4`,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "No of wallets",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "notify",
          description: "3 tracked Wallets",
        },
        explorer: {
          state: "notify",
          description: "7 Wallets",
        },
        alpha: {
          state: "available",
          description: "Unlimited Wallets",
        },
      },
    },
    {
      title: "Total net worth",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "notify",
          description: "$2 000 total net worth",
        },
        explorer: {
          state: "notify",
          description: "$50 000 total net worth",
        },
        alpha: {
          state: "available",
          description: "Unlimited total net worth",
        },
      },
    },
    {
      title: "Portfolio alert",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Portfolio summary",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Token analysis",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "CEX tracking",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Aggregate data multiple accounts",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Analysis",
      featureStatus: "main",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Position detail",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Custom token category",
      featureStatus: "part",
      tippy: {
        used: true,
        title:"Custom your token category to diversify your portfolio on your own way",
        content: "~/assets/pricing/Custom-Allocation.mp4"
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Risk healthy tag",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "PnL analysis",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Risk metrics",
      featureStatus: "part",
      tippy: {
        used: true,
        title: "Know what is your portfolio risk, in every single token you hold",
        content: `~/assets/pricing/Risk.mp4`,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Correlation matrix",
      featureStatus: "part",
      tippy: {
        used: true,
        title: "",
        content: `~/assets/pricing/Correlation-Matrix.mp4`,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Sharpe ratio",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Money flow",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Activities analysis",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Optimize earning",
      featureStatus: "main",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Yield farming suggestion",
      featureStatus: "part",
      tippy: {
        used: true,
        title: "Get up to 1000+ yield farming opportunities to boost your earning",
        content: `~/assets/pricing/Yield-Farming.mp4`,
      },
      content: {
        free: {
          state: "available",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Smart token allocation",
      featureStatus: "part",
      tippy: {
        used: true,
        title: "We suggest you how to optimize your portfolio to minimize the risk while maximizing the return",
        content: `~/assets/pricing/Rebalance.mp4`,
      },
      content: {
        free: {
          state: "notify",
          description: "(Soon)",
        },
        explorer: {
          state: "notify",
          description: "(Soon)",
        },
        alpha: {
          state: "notify",
          description: "(Soon)",
        },
      },
    },
    {
      title: "Whale compare",
      featureStatus: "part",
      tippy: {
        used: false,
        title: "",
        content: ``,
      },
      content: {
        free: {
          state: "unavailable",
          description: "",
        },
        explorer: {
          state: "available",
          description: "",
        },
        alpha: {
          state: "available",
          description: "",
        },
      },
    },
  ];
  
export const nimbusCompareFeatureData: CompareFeature[] = [
    {
      title: "On-chain tracking",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "Manual",
        },
        coinstats: {
          state: "available",
          description: "",
        },
        debank: {
          state: "available",
          description: "",
        },
        nansen: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "DEFI position",
      content: {
        nimbus: {
          state: "notify",
          description: "(Soon)",
        },
        excel: {
          state: "unavailable",
          description: "Manual",
        },
        coinstats: {
          state: "notify",
          description: "Not fully support",
        },
        debank: {
          state: "available",
          description: "",
        },
        nansen: {
          state: "notify",
          description: "Not fully support",
        },
      },
    },
    {
      title: "CEX tracking",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "Manual",
        },
        coinstats: {
          state: "available",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
    {
      title: "Notification",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "",
        },
        coinstats: {
          state: "available",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
    {
      title: "Market Data",
      content: {
        nimbus: {
          state: "unavailable",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "",
        },
        coinstats: {
          state: "unavailable",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "available",
          description: "",
        },
      },
    },
    {
      title: "Risks metrics",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "",
        },
        coinstats: {
          state: "unavailable",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
    {
      title: "Innvestment metrics(Risks, return, Sharpe ratio, ...)",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "",
        },
        coinstats: {
          state: "unavailable",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
    {
      title: "Optimize earning",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "",
        },
        coinstats: {
          state: "unavailable",
          description: "",
        },
        debank: {
          state: "unavailable",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
    {
      title: "Aggregate data multiple accounts",
      content: {
        nimbus: {
          state: "available",
          description: "",
        },
        excel: {
          state: "unavailable",
          description: "Manual",
        },
        coinstats: {
          state: "available",
          description: "",
        },
        debank: {
          state: "available",
          description: "",
        },
        nansen: {
          state: "unavailable",
          description: "",
        },
      },
    },
  ];
  
  