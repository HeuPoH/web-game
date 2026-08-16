import type { Tile } from '@game/shared-types';

interface Point {
  x: number;
  y: number;
}

/**
 * Генерирует лабиринт с несколькими путями к выходу.
 * Пол внутри лабиринта может быть трёх типов:
 *   sId = 0 → ground.png
 *   sId = 1 → ground_01.png
 *   sId = 2 → ground_02.png
 * Все стены — одного типа (sId не важен, используется одна текстура).
 * Для разнообразия создаются «пятна» вокруг случайных точек, которые
 * меняют стиль пола на 1 или 2.
 */
export function generateMaze(
  width: number,
  height: number,
  extraPassages: number = 0.05,
) {
  const stringMaze = generateIdealMaze(width, height);
  const rows = stringMaze.length;
  const cols = stringMaze[0]!.length;

  // Переводим в Tile[][] одним проходом
  const maze: Tile[][] = Array.from({ length: rows });
  for (let y = 0; y < rows; y++) {
    const row = Array.from({ length: cols });
    for (let x = 0; x < cols; x++) {
      row[x] = { type: stringMaze[y]![x] as 'wall' | 'floor', sId: 0 };
    }
    maze[y] = row as Tile[];
  }

  // Собираем и фильтруем стены за один проход
  const deadEndWalls: Point[] = [];
  for (let y = 1; y < rows - 1; y++) {
    const row = maze[y]!;
    const rowAbove = maze[y - 1]!;
    const rowBelow = maze[y + 1]!;

    for (let x = 1; x < cols - 1; x++) {
      if (row[x]!.type !== 'wall') continue;

      const floorCount =
        (rowAbove[x]!.type === 'floor' ? 1 : 0) +
        (rowBelow[x]!.type === 'floor' ? 1 : 0) +
        (row[x - 1]!.type === 'floor' ? 1 : 0) +
        (row[x + 1]!.type === 'floor' ? 1 : 0);

      if (floorCount >= 2 && floorCount <= 3) {
        deadEndWalls.push({ x, y });
      }
    }
  }

  // Удаляем случайные стены для создания циклов
  const maxToRemove = Math.min(
    Math.floor(deadEndWalls.length * extraPassages),
    deadEndWalls.length,
  );

  // Алгоритм Фишера-Йетса для перемешивания (частичное)
  for (let i = 0; i < maxToRemove; i++) {
    const j = i + Math.floor(Math.random() * (deadEndWalls.length - i));
    const wall = deadEndWalls[j]!;
    maze[wall.y]![wall.x] = { type: 'floor', sId: 0 };

    // Меняем местами, чтобы избежать повторного выбора
    deadEndWalls[j] = deadEndWalls[i]!;
  }

  // Старт и финиш гарантированно проходимы
  maze[1]![1] = { type: 'floor', sId: 0 };
  maze[rows - 2]![cols - 2] = { type: 'floor', sId: 0 };

  // Создаём «пятна» — зоны вокруг случайных точек
  applyFloorSpots(maze, rows, cols);

  return {
    maze,
    start: { x: 1, y: 1 },
    finish: { x: cols - 2, y: rows - 2 },
  };
}

/**
 * Применяет пятна текстур пола к лабиринту
 */
function applyFloorSpots(maze: Tile[][], rows: number, cols: number): void {
  const spotCount = Math.floor(Math.random() * 3) + 3; // 3-5
  const spotRadius = 5;
  const spotRadiusSq = spotRadius * spotRadius;

  for (let i = 0; i < spotCount; i++) {
    const centerX =
      spotRadius + Math.floor(Math.random() * (cols - 2 * spotRadius));
    const centerY =
      spotRadius + Math.floor(Math.random() * (rows - 2 * spotRadius));
    const styleId = Math.random() < 0.5 ? 1 : 2;

    const minY = Math.max(1, centerY - spotRadius);
    const maxY = Math.min(rows - 2, centerY + spotRadius);
    const minX = Math.max(1, centerX - spotRadius);
    const maxX = Math.min(cols - 2, centerX + spotRadius);

    for (let y = minY; y <= maxY; y++) {
      const dy = y - centerY;
      const dySq = dy * dy;
      const row = maze[y]!;

      for (let x = minX; x <= maxX; x++) {
        if (row[x]!.type !== 'floor') continue;

        const dx = x - centerX;
        if (dx * dx + dySq <= spotRadiusSq) {
          row[x]!.sId = styleId;
        }
      }
    }
  }
}

/**
 * Генерирует лабиринт методом Олдоса-Бродера.
 */
export function generateIdealMaze(width: number, height: number): string[][] {
  const rows = height * 2 + 1;
  const cols = width * 2 + 1;

  const maze: string[][] = Array.from({ length: rows }, () =>
    Array.from<string>({ length: cols }).fill('wall'),
  );

  // Используем плоский массив для visited
  const visited = new Uint8Array(width * height);

  let currentX = Math.floor(Math.random() * width);
  let currentY = Math.floor(Math.random() * height);
  visited[currentY * width + currentX] = 1;
  let visitedCount = 1;
  const totalCells = width * height;

  while (visitedCount < totalCells) {
    const neighbors: Point[] = [];
    if (currentY > 0) neighbors.push({ x: currentX, y: currentY - 1 });
    if (currentY < height - 1) neighbors.push({ x: currentX, y: currentY + 1 });
    if (currentX > 0) neighbors.push({ x: currentX - 1, y: currentY });
    if (currentX < width - 1) neighbors.push({ x: currentX + 1, y: currentY });

    const { x: nx, y: ny } =
      neighbors[Math.floor(Math.random() * neighbors.length)]!;

    if (!visited[ny * width + nx]) {
      const wallY = currentY * 2 + 1 + (ny - currentY);
      const wallX = currentX * 2 + 1 + (nx - currentX);
      maze[wallY]![wallX] = 'floor';
      maze[ny * 2 + 1]![nx * 2 + 1] = 'floor';

      visited[ny * width + nx] = 1;
      visitedCount++;
    }

    currentX = nx;
    currentY = ny;
  }

  // Заполняем центры клеток
  for (let y = 0; y < height; y++) {
    const rowIndex = y * 2 + 1;
    const row = maze[rowIndex]!;
    for (let x = 0; x < width; x++) {
      row[x * 2 + 1] = 'floor';
    }
  }

  return maze;
}
