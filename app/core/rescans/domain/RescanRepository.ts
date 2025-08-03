import { Rescan } from "./Rescan";
import { RescanId } from "./RescanId";

export interface RescanRepository {
  save(rescan: Rescan): Promise<void>;
  findLatestRescan(ownerId: string): Promise<Rescan>;
}
