import { DndAction } from "../util";

export class FoundrySoundHandler {
    async play(_actions: DndAction[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    stop(): null {
        throw new Error("Method not implemented.");
    }
}

/**
 * How will the sound handler track users in the session or whatever?
 * Foundry User -> Discord Dungeon User (Set via config modal or login check?)
 * Foundry Character -> Discord Dungeon Character (Mapped by name)
 * 
 * 1. Events only fire on the foundry client where they're triggered by a user
 * 2. Weather we have an id or not each client will need to connect to the websocket session
 * 3. The server session will need to know the character name, the discord dungeon user id
 *    if available, and the session name or some other unique id.
 * 
 * Option 1: client -> API -> redis -> session owning server -> websocket -> clients
 * Option 2: client -> websocket -> redis pub/sub -> session owning server -> websocket -> clients
 * Option 3: client -> API -> read session from DB/Redis -> respond to client
 * 
 * 
 */