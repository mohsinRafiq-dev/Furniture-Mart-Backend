import {
  VisitorSession,
  ProductView,
  DailyAnalytics,
} from "../models/Analytics.js";

export class AnalyticsService {
  // Track visitor session
  static async trackVisitorSession(data: {
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    source: "direct" | "search" | "social" | "referral" | "other";
    deviceType: "mobile" | "tablet" | "desktop";
  }) {
    try {
      const session = await VisitorSession.findOne({
        sessionId: data.sessionId,
      });

      if (session) {
        // Update existing session
        session.endTime = new Date();
        session.pageViews += 1;
        await session.save();
        return session;
      } else {
        // Create new session
        const newSession = new VisitorSession(data);
        await newSession.save();
        return newSession;
      }
    } catch (error) {
      console.error("Error tracking visitor session:", error);
      throw error;
    }
  }

  // Track product view
  static async trackProductView(data: {
    productId: string;
    productName: string;
    sessionId: string;
    userId?: string;
    timeSpent?: number;
    action?: "view" | "add_to_cart" | "purchase" | "wishlist";
  }) {
    try {
      const productView = new ProductView({
        ...data,
        action: data.action || "view",
        timeSpent: data.timeSpent || 0,
      });
      await productView.save();
      return productView;
    } catch (error) {
      console.error("Error tracking product view:", error);
      throw error;
    }
  }

  // Get analytics summary
  static async getAnalyticsSummary(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get total visitors
      const totalVisitors = await VisitorSession.countDocuments({
        startTime: { $gte: startDate },
      });

      // Get total page views
      const totalPageViews = await ProductView.countDocuments({
        viewedAt: { $gte: startDate },
      });

      // Get total sessions
      const totalSessions = await VisitorSession.countDocuments({
        startTime: { $gte: startDate },
      });

      // Get average time on site (in seconds)
      const sessionData = await VisitorSession.aggregate([
        { $match: { startTime: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgTime: {
              $avg: {
                $subtract: [
                  { $ifNull: ["$endTime", new Date()] },
                  "$startTime",
                ],
              },
            },
          },
        },
      ]);

      const averageTimeOnSite = sessionData[0]?.avgTime
        ? Math.floor(sessionData[0].avgTime / 1000)
        : 0; // Convert ms to seconds

      // Get bounce rate (sessions with 0 page views)
      const bouncedSessions = await VisitorSession.countDocuments({
        startTime: { $gte: startDate },
        pageViews: 0,
      });
      const bounceRate =
        totalSessions > 0
          ? Math.round((bouncedSessions / totalSessions) * 100)
          : 0;

      // Get top products by views
      const topProducts = await ProductView.aggregate([
        { $match: { viewedAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$productId",
            productName: { $first: "$productName" },
            views: { $sum: 1 },
            purchases: {
              $sum: { $cond: [{ $eq: ["$action", "purchase"] }, 1, 0] },
            },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 5 },
      ]);

      // Get conversion rate
      const totalPurchases = await ProductView.countDocuments({
        viewedAt: { $gte: startDate },
        action: "purchase",
      });
      const conversionRate =
        totalPageViews > 0
          ? parseFloat(((totalPurchases / totalPageViews) * 100).toFixed(2))
          : 0;

      // Get traffic sources
      const trafficSources = await VisitorSession.aggregate([
        { $match: { startTime: { $gte: startDate } } },
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ]);

      const sources = {
        direct: 0,
        search: 0,
        social: 0,
        referral: 0,
        other: 0,
      };

      trafficSources.forEach((source) => {
        sources[source._id as keyof typeof sources] = source.count;
      });

      // Get visitors this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const visitorsThisMonth = await VisitorSession.countDocuments({
        startTime: { $gte: thisMonth },
      });

      // Get page views this month
      const pageViewsThisMonth = await ProductView.countDocuments({
        viewedAt: { $gte: thisMonth },
      });

      return {
        totalVisitors,
        visitorsThisMonth,
        totalPageViews,
        pageViewsThisMonth,
        totalSessions,
        averageTimeOnSite: this.formatSeconds(averageTimeOnSite),
        bounceRate: `${bounceRate}%`,
        conversionRate: `${conversionRate}%`,
        topProducts: topProducts.map((p) => ({
          id: p._id,
          name: p.productName,
          views: p.views,
          purchases: p.purchases,
        })),
        trafficSources: [
          {
            source: "Direct",
            percentage: Math.round(
              (sources.direct / totalSessions) * 100 || 0
            ),
            color: "from-blue-500 to-blue-600",
          },
          {
            source: "Search",
            percentage: Math.round(
              (sources.search / totalSessions) * 100 || 0
            ),
            color: "from-green-500 to-green-600",
          },
          {
            source: "Social",
            percentage: Math.round(
              (sources.social / totalSessions) * 100 || 0
            ),
            color: "from-purple-500 to-purple-600",
          },
          {
            source: "Referral",
            percentage: Math.round(
              (sources.referral / totalSessions) * 100 || 0
            ),
            color: "from-orange-500 to-orange-600",
          },
        ],
      };
    } catch (error) {
      console.error("Error getting analytics summary:", error);
      throw error;
    }
  }

  // Format seconds to readable format
  private static formatSeconds(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }

  // Get product specific analytics
  static async getProductAnalytics(productId: string) {
    try {
      const views = await ProductView.countDocuments({ productId });
      const purchases = await ProductView.countDocuments({
        productId,
        action: "purchase",
      });
      const cartAdds = await ProductView.countDocuments({
        productId,
        action: "add_to_cart",
      });
      const wishlistAdds = await ProductView.countDocuments({
        productId,
        action: "wishlist",
      });

      return {
        productId,
        views,
        purchases,
        cartAdds,
        wishlistAdds,
        conversionRate: views > 0 ? ((purchases / views) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error("Error getting product analytics:", error);
      throw error;
    }
  }
}
