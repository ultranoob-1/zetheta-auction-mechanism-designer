// Main auction mechanism designer module
// Exports all auction types and utilities

export { EnglishAuction } from './english-auction';
export { DutchAuction } from './dutch-auction';

// Sealed Bid (Vickrey) Auction Implementation
export class VickreyAuction {
  private bids: Map<string, { hash: string; amount?: number; salt?: string }> = new Map();
  private biddingPhase: boolean = true;
  private revealDeadline: Date;

  constructor(biddingEndTime: Date, revealDuration: number) {
    this.revealDeadline = new Date(biddingEndTime.getTime() + revealDuration);
  }

  submitSealedBid(bidderId: string, bidHash: string): boolean {
    if (!this.biddingPhase) throw new Error('Bidding phase has ended');
    if (this.bids.has(bidderId)) throw new Error('Bidder already submitted a bid');
    
    this.bids.set(bidderId, { hash: bidHash });
    return true;
  }

  revealBid(bidderId: string, amount: number, salt: string): boolean {
    if (this.biddingPhase) throw new Error('Still in bidding phase');
    if (Date.now() > this.revealDeadline.getTime()) throw new Error('Reveal deadline passed');

    const bid = this.bids.get(bidderId);
    if (!bid) throw new Error('No sealed bid found for this bidder');
    if (bid.amount !== undefined) throw new Error('Bid already revealed');

    // Simple hash verification
    const crypto = require('crypto');
    const expectedHash = crypto.createHash('sha256').update(`${amount}${salt}`).digest('hex');
    if (expectedHash !== bid.hash) throw new Error('Invalid reveal hash');

    bid.amount = amount;
    bid.salt = salt;
    return true;
  }

  endBiddingPhase(): void {
    this.biddingPhase = false;
  }

  determineWinner(): { winner: string | null; price: number } {
    const revealedBids = Array.from(this.bids.entries())
      .filter(([_, bid]) => bid.amount !== undefined)
      .sort((a, b) => (b[1].amount || 0) - (a[1].amount || 0));

    if (revealedBids.length === 0) return { winner: null, price: 0 };

    const winner = revealedBids[0][0];
    const price = revealedBids.length > 1 ? (revealedBids[1][1].amount || 0) : (revealedBids[0][1].amount || 0);

    return { winner, price };
  }
}
