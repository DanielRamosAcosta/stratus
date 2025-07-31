import * as FileRepository from "../core/files/infrastructure/FileRepository";
import {
  cleanCodeBook,
  coolWallpaper,
  italyPhoto,
  highwayToHellSong,
  sampleTextFile,
} from "../../tests/FileFixtures";

export async function populateFiles() {
  await FileRepository.save(cleanCodeBook);
  await FileRepository.save(coolWallpaper);
  await FileRepository.save(italyPhoto);
  await FileRepository.save(highwayToHellSong);
  await FileRepository.save(sampleTextFile);
}
