import { DndAction } from "../util";

export interface SoundHandler {
    play(actions: DndAction[]): Promise<void>;
    stop(): null;
}