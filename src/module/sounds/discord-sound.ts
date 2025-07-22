import { DndAction } from "../util";
import { SoundHandler } from "./sound-interface";
import { DefaultService as DiscordDungeonApi } from "../../generated/discord-dungeon-api";


export class DiscordSoundHandler implements SoundHandler {
    async play(actions: DndAction[]): Promise<void> {
        await DiscordDungeonApi.postApiV1DndEvent({
            dnd_actions: actions,
          });
    }
    stop(): null {
        throw new Error("Method not implemented.");
    }
}