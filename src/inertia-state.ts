type Vector2 = [number, number];

export type InertiaEvent = {
  delta: Vector2;
  movement: Vector2;
};

export type InertiaStateInit = {
  coefficient?: number;
};

const approxZero = (v: number): boolean => Math.abs(v) < 0.001;

export class InertiaState {
  private updating = false;
  private timer: NodeJS.Timeout | null = null;
  private callbacks: Set<(ev: InertiaEvent) => void> = new Set();

  private lastMove: Vector2 = [0, 0];
  private moveDelta: Vector2 = [0, 0];
  private lastMoveDelta: Vector2 = [0, 0];

  private movement: Vector2 = [0, 0];
  private velocity: Vector2 = [0, 0];

  frictionCoefficient: number;

  constructor(init?: InertiaStateInit) {
    this.frictionCoefficient = init?.coefficient ?? 0.85;
  }

  addCallback(callback: (ev: InertiaEvent) => void): () => void {
    this.callbacks.add(callback);

    return () => {
      this.callbacks.delete(callback);
    };
  }

  start([moveX, moveY]: Vector2): void {
    this.updating = true;

    this.lastMove[0] = moveX;
    this.lastMove[1] = moveY;

    this.reset();
    this.updateVelocity();
  }

  update([moveX, moveY]: Vector2): void {
    if (!this.updating) return;

    const deltaX = moveX - this.lastMove[0];
    const deltaY = moveY - this.lastMove[1];
    this.movement[0] += deltaX;
    this.movement[1] += deltaY;

    this.lastMove[0] = moveX;
    this.lastMove[1] = moveY;
  }

  stop(): void {
    this.updating = false;
  }

  reset(): void {
    this.timer !== null && clearTimeout(this.timer);

    this.movement[0] = 0;
    this.movement[1] = 0;
    this.velocity[0] = 0;
    this.velocity[1] = 0;
  }

  private updateVelocity() {
    if (
      !this.updating &&
      approxZero(this.velocity[0]) &&
      approxZero(this.velocity[1])
    )
      return;

    this.timer = setTimeout(() => this.updateVelocity(), 1000 / 60);

    if (this.updating) {
      this.lastMoveDelta[0] = this.moveDelta[0];
      this.lastMoveDelta[1] = this.moveDelta[1];
      this.moveDelta[0] = this.lastMove[0];
      this.moveDelta[1] = this.lastMove[1];

      this.velocity[0] = this.moveDelta[0] - this.lastMoveDelta[0];
      this.velocity[1] = this.moveDelta[1] - this.lastMoveDelta[1];
    } else {
      const [velocityX, velocityY] = this.velocity;
      this.lastMove[0] += velocityX;
      this.lastMove[1] += velocityY;
      this.movement[0] += velocityX;
      this.movement[1] += velocityY;

      this.velocity[0] *= this.frictionCoefficient;
      this.velocity[1] *= this.frictionCoefficient;

      for (const callback of this.callbacks) {
        callback({
          delta: this.velocity,
          movement: this.movement,
        });
      }
    }
  }
}
