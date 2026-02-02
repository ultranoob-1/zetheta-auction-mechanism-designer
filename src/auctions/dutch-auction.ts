// Dutch Auction - Price descends from starting price
export class DutchAuction {
  private startingPrice: number;
  private reservePrice: number;
  private priceDecrement: number;
  private decrementInterval: number;
  private currentPrice: number;
  private winner: string | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    startingPrice: number,
    reservePrice: number,
    priceDecrement: number,
    decrementInterval: number
  ) {
    this.startingPrice = startingPrice;
    this.reservePrice = reservePrice;
    this.priceDecrement = priceDecrement;
    this.decrementInterval = decrementInterval;
    this.currentPrice = startingPrice;
  }

  start(): void {
    this.intervalId = setInterval(() => {
      this.currentPrice = Math.max(
        this.currentPrice - this.priceDecrement,
        this.reservePrice
      );
      console.log(`Price reduced to ${this.currentPrice}`);

      if (this.currentPrice === this.reservePrice) {
        this.stop();
      }
    }, this.decrementInterval);
  }

  acceptBid(bidderId: string): { success: boolean; price: number } {
    if (this.winner !== null) {
      return { success: false, price: 0 };
    }

    this.winner = bidderId;
    const finalPrice = this.currentPrice;
    this.stop();
    return { success: true, price: finalPrice };
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getCurrentPrice(): number {
    return this.currentPrice;
  }

  getWinner(): string | null {
    return this.winner;
  }
}
