export class TypingSpeedTracker {
  private keypressTimestamps: number[] = [];
  private currentWpm = 0;
  private lastLogTime = 0;

  public recordKeystroke(charCountInEditor: number): number {
    const now = Date.now();
    this.keypressTimestamps.push(now);
    const cutoff = now - 30000;
    this.keypressTimestamps = this.keypressTimestamps.filter(timestamp => timestamp >= cutoff);

    if (this.keypressTimestamps.length > 2) {
      const timeSpanMinutes = (now - this.keypressTimestamps[0]) / 60000;
      if (timeSpanMinutes > 0.02) {
        this.currentWpm = Math.round((this.keypressTimestamps.length / 5) / timeSpanMinutes);
      }
    } else {
      this.currentWpm = 0;
    }

    if (now - this.lastLogTime > 1500) {
      this.lastLogTime = now;
      console.log(`[Typing Tracker] Current Typing Speed: ${this.currentWpm} WPM (Characters in buffer: ${charCountInEditor})`);
    }

    return this.currentWpm;
  }

  public getWPM(): number {
    return this.currentWpm;
  }

  public reset(): void {
    this.keypressTimestamps = [];
    this.currentWpm = 0;
  }
}

export const typingTracker = new TypingSpeedTracker();
