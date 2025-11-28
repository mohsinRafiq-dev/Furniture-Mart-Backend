import { Router, Request, Response } from "express";
import { AnalyticsService } from "../utils/AnalyticsService";

const router = Router();

// Track visitor session
router.post("/track-session", async (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      ipAddress,
      userAgent,
      referrer,
      source,
      deviceType,
    } = req.body;

    const session = await AnalyticsService.trackVisitorSession({
      sessionId,
      ipAddress,
      userAgent,
      referrer,
      source,
      deviceType,
    });

    res.json({ success: true, session });
  } catch (error) {
    console.error("Error tracking session:", error);
    res.status(500).json({ error: "Failed to track session" });
  }
});

// Track product view
router.post("/track-product-view", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      productName,
      sessionId,
      userId,
      timeSpent,
      action,
    } = req.body;

    const productView = await AnalyticsService.trackProductView({
      productId,
      productName,
      sessionId,
      userId,
      timeSpent,
      action,
    });

    res.json({ success: true, productView });
  } catch (error) {
    console.error("Error tracking product view:", error);
    res.status(500).json({ error: "Failed to track product view" });
  }
});

// Get analytics summary (admin only)
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const summary = await AnalyticsService.getAnalyticsSummary(days);
    res.json(summary);
  } catch (error) {
    console.error("Error getting analytics summary:", error);
    res.status(500).json({ error: "Failed to get analytics summary" });
  }
});

// Get product analytics (admin only)
router.get("/product/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const analytics = await AnalyticsService.getProductAnalytics(productId);
    res.json(analytics);
  } catch (error) {
    console.error("Error getting product analytics:", error);
    res.status(500).json({ error: "Failed to get product analytics" });
  }
});

export default router;
