export interface DirectionalInput {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
}

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface ArenaBounds {
  readonly width: number;
  readonly height: number;
}

export function resolveMovement(input: DirectionalInput, speed: number): Vector2 {
  const x = Number(input.right) - Number(input.left);
  const y = Number(input.down) - Number(input.up);
  if ((x === 0 && y === 0) || speed <= 0) return { x: 0, y: 0 };

  const magnitude = Math.hypot(x, y);
  return { x: (x / magnitude) * speed, y: (y / magnitude) * speed };
}

export function clampPlayerPosition(
  position: Vector2,
  radius: number,
  arena: ArenaBounds,
): Vector2 {
  return {
    x: Math.min(arena.width - radius, Math.max(radius, position.x)),
    y: Math.min(arena.height - radius, Math.max(radius, position.y)),
  };
}
