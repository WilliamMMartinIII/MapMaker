import App from 'App';
import SquareResolver from 'resolvers/SquareResolver';
import { Tool } from 'Tool';
import * as Tile from 'Tile';
import Vec from 'Vec';
import { WallEdge, WallFill } from 'Wall';

export default class EraserTool implements Tool {
  private app: App;
  private resolver: SquareResolver;

  constructor(app: App) {
    this.app = app;
    this.resolver = SquareResolver.getInstance();
  }

  cancel(): void {
    this.app.setHovered([]);
  }

  hover(startCoords: Vec, endCoords: Vec): void {
    const map = this.app.getMap();
    const hovered = this.resolver.resolve(
        this.app.toMapSpace(startCoords),
        this.app.toMapSpace(endCoords));

    this.app.setHovered(hovered);
  }
  
  select(startCoords: Vec, endCoords: Vec): void {
    startCoords = this.app.toMapSpace(startCoords);
    endCoords = this.app.toMapSpace(endCoords);
    let map = this.app.getMap();

    const left = Math.floor(Math.min(startCoords.x, endCoords.x));
    const top = Math.floor(Math.min(startCoords.y, endCoords.y));
    const right = Math.floor(Math.max(startCoords.x, endCoords.x));
    const bottom = Math.floor(Math.max(startCoords.y, endCoords.y));

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        const index = Tile.Index.of(x, y);
        const tile = map.getTile(index);
        const restoreEdges = new Map<Tile.Region, WallEdge>();
        
        if (x === left && tile) {
          restoreEdges.set(Tile.Region.LEFT_EDGE, tile.getWallEdge(Tile.Region.LEFT_EDGE));
        }

        if (y === top && tile) {
          restoreEdges.set(Tile.Region.TOP_EDGE, tile.getWallEdge(Tile.Region.TOP_EDGE));
        }

        map = map.removeTile(Tile.Index.of(x, y));

        if (restoreEdges.size > 0) {
          let tile = new Tile.Tile(index);
          restoreEdges.forEach((edge, region) => {
            tile = tile.setWallEdge(region, edge);
          });
          map = map.setTile(tile);
        }
      }
    }

    this.app.setMap(map);
    this.app.setHovered([]);
  }
}