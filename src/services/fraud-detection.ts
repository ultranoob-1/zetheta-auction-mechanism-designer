// Fraud Detection Service for Auction System
// Implements pattern detection and risk scoring

export interface FraudAlert {
  userId: string;
  auctionId: string;
  riskScore: number;
  reason: string;
  timestamp: Date;
}

export class FraudDetectionService {
  private readonly suspiciousPatternThreshold = 0.7;
  private readonly rapidBidThreshold = 3; // bids in 5 seconds
  private userBidHistory: Map<string, any[]> = new Map();

  // Detect rapid bidding pattern
  detectRapidBidding(userId: string, auctionId: string): number {
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    
    const key = `${userId}-${auctionId}`;
    if (!this.userBidHistory.has(key)) {
      this.userBidHistory.set(key, []);
    }
    
    const history = this.userBidHistory.get(key)!;
    const recentBids = history.filter(bid => bid.timestamp > fiveSecondsAgo);
    
    if (recentBids.length >= this.rapidBidThreshold) {
      return 0.6; // High risk score
    }
    return 0.0;
  }

  // Detect price manipulation
  detectPriceManipulation(currentPrice: number, previousPrice: number): number {
    const priceJump = Math.abs(currentPrice - previousPrice) / previousPrice;
    if (priceJump > 0.5) { // More than 50% jump
      return 0.8;
    }
    if (priceJump > 0.25) { // More than 25% jump
      return 0.5;
    }
    return 0.0;
  }

  // Detect bid shilling (collusion)
  detectBidShilling(bidderIds: string[], auctionData: any): number {
    const uniqueUsers = new Set(bidderIds);
    const repetitionRate = 1 - (uniqueUsers.size / bidderIds.length);
    
    if (repetitionRate > 0.6) {
      return 0.85; // Very high risk
    }
    if (repetitionRate > 0.4) {
      return 0.6;
    }
    return 0.0;
  }

  // Calculate overall fraud risk
  calculateRiskScore(userId: string, auctionId: string, bidAmount: number, auctionContext: any): number {
    let totalScore = 0;
    let factors = 0;

    const rapidBidScore = this.detectRapidBidding(userId, auctionId);
    const priceManipScore = this.detectPriceManipulation(bidAmount, auctionContext.lastPrice || 0);
    const shillingScore = this.detectBidShilling([userId], auctionContext);

    totalScore = (rapidBidScore + priceManipScore + shillingScore) / 3;
    return Math.min(totalScore, 1.0);
  }

  // Generate fraud alert if threshold exceeded
  generateAlert(userId: string, auctionId: string, riskScore: number): FraudAlert | null {
    if (riskScore >= this.suspiciousPatternThreshold) {
      return {
        userId,
        auctionId,
        riskScore,
        reason: this.getRiskReason(riskScore),
        timestamp: new Date()
      };
    }
    return null;
  }

  private getRiskReason(score: number): string {
    if (score > 0.85) return 'Critical fraud pattern detected';
    if (score > 0.7) return 'High fraud risk - suspicious bidding behavior';
    if (score > 0.5) return 'Medium fraud risk - unusual bid pattern';
    return 'Low fraud risk';
  }

  recordBid(userId: string, auctionId: string, bidAmount: number): void {
    const key = `${userId}-${auctionId}`;
    if (!this.userBidHistory.has(key)) {
      this.userBidHistory.set(key, []);
    }
    this.userBidHistory.get(key)!.push({
      amount: bidAmount,
      timestamp: new Date()
    });
  }
}

export default FraudDetectionService;
