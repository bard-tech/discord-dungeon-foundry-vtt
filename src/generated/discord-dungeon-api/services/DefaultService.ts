/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminCreateFolderResquest } from '../models/AdminCreateFolderResquest';
import type { AdminNewSoundRequest } from '../models/AdminNewSoundRequest';
import type { AdminUpdateFolderRequest } from '../models/AdminUpdateFolderRequest';
import type { CharacterResponse } from '../models/CharacterResponse';
import type { CreateEventRequest } from '../models/CreateEventRequest';
import type { CreateFolderRequest } from '../models/CreateFolderRequest';
import type { CreateGuildRequest } from '../models/CreateGuildRequest';
import type { FolderResponse } from '../models/FolderResponse';
import type { GuildResponse } from '../models/GuildResponse';
import type { ListFolderResponse } from '../models/ListFolderResponse';
import type { ListUserFolderResponse } from '../models/ListUserFolderResponse';
import type { NewCharacterRequest } from '../models/NewCharacterRequest';
import type { NewSoundProfileRequest } from '../models/NewSoundProfileRequest';
import type { NewSoundRequest } from '../models/NewSoundRequest';
import type { SoundProfileResponse } from '../models/SoundProfileResponse';
import type { SoundResponse } from '../models/SoundResponse';
import type { UpdateCharacterRequest } from '../models/UpdateCharacterRequest';
import type { UpdateFolderRequest } from '../models/UpdateFolderRequest';
import type { UpdateGuildRequest } from '../models/UpdateGuildRequest';
import type { UpdateSoundProfileRequest } from '../models/UpdateSoundProfileRequest';
import type { UpdateSoundRequest } from '../models/UpdateSoundRequest';
import type { UpdateUserRequest } from '../models/UpdateUserRequest';
import type { UserFolderResponse } from '../models/UserFolderResponse';
import type { UserResponse } from '../models/UserResponse';
import type { UserSoundResponse } from '../models/UserSoundResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {

    /**
     * @param body
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminFolders(
        body: AdminCreateFolderResquest,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/folders',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static deleteApiV1AdminFolders(
        folderId: string,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminFolders1(
        folderId: string,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @param body
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static putApiV1AdminFolders(
        folderId: string,
        body: AdminUpdateFolderRequest,
    ): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns ListFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminFoldersList(
        folderId: string,
    ): CancelablePromise<ListFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/folders/{folder_id}/list',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminGuilds(): CancelablePromise<Array<GuildResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/guilds',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static postApiV1AdminGuilds(
        body: CreateGuildRequest,
    ): CancelablePromise<GuildResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/guilds',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param discordGuildId
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminGuildsByDiscordId(
        discordGuildId: string,
    ): CancelablePromise<GuildResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/guilds/by-discord-id/{discord_guild_id}',
            path: {
                'discord_guild_id': discordGuildId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param guildId
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static deleteApiV1AdminGuilds(
        guildId: string,
    ): CancelablePromise<GuildResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/admin/guilds/{guild_id}',
            path: {
                'guild_id': guildId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param guildId
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminGuilds1(
        guildId: string,
    ): CancelablePromise<GuildResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/guilds/{guild_id}',
            path: {
                'guild_id': guildId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param guildId
     * @param body
     * @returns GuildResponse OK
     * @throws ApiError
     */
    public static putApiV1AdminGuilds(
        guildId: string,
        body: UpdateGuildRequest,
    ): CancelablePromise<GuildResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/guilds/{guild_id}',
            path: {
                'guild_id': guildId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param profileId
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminProfile(
        profileId: string,
    ): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/profile/{profile_id}',
            path: {
                'profile_id': profileId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns SoundResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminSounds(): CancelablePromise<Array<SoundResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/sounds',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns SoundResponse OK
     * @throws ApiError
     */
    public static postApiV1AdminSounds(
        body: AdminNewSoundRequest,
    ): CancelablePromise<SoundResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/admin/sounds',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @returns SoundResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminSounds1(
        soundId: string,
    ): CancelablePromise<SoundResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/sounds/{sound_id}',
            path: {
                'sound_id': soundId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminUsers(): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/users',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param userId
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static getApiV1AdminUsers1(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/admin/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param userId
     * @param body
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static putApiV1AdminUsers(
        userId: string,
        body: UpdateUserRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/admin/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns FolderResponse OK
     * @throws ApiError
     */
    public static getApiV1DefaultFolder(): CancelablePromise<FolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/default-folder',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns ListFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1DefaultFolderList(): CancelablePromise<ListFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/default-folder/list',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static getApiV1DefaultProfile(): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/default-profile',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns void
     * @throws ApiError
     */
    public static postApiV1DndEvent(
        body: CreateEventRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/dnd-event',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static getApiV1Me(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/me',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns UserResponse OK
     * @throws ApiError
     */
    public static putApiV1Me(
        body: UpdateUserRequest,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/me',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns CharacterResponse OK
     * @throws ApiError
     */
    public static getApiV1MyCharacters(): CancelablePromise<Array<CharacterResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-characters',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns CharacterResponse OK
     * @throws ApiError
     */
    public static postApiV1MyCharacters(
        body: NewCharacterRequest,
    ): CancelablePromise<CharacterResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/my-characters',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param characterId
     * @returns CharacterResponse OK
     * @throws ApiError
     */
    public static deleteApiV1MyCharacters(
        characterId: string,
    ): CancelablePromise<CharacterResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/my-characters/{character_id}',
            path: {
                'character_id': characterId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param characterId
     * @returns CharacterResponse OK
     * @throws ApiError
     */
    public static getApiV1MyCharacters1(
        characterId: string,
    ): CancelablePromise<CharacterResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-characters/{character_id}',
            path: {
                'character_id': characterId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param characterId
     * @param body
     * @returns CharacterResponse OK
     * @throws ApiError
     */
    public static putApiV1MyCharacters(
        characterId: string,
        body: UpdateCharacterRequest,
    ): CancelablePromise<CharacterResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/my-characters/{character_id}',
            path: {
                'character_id': characterId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1MyFolders(): CancelablePromise<Array<UserFolderResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-folders',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static postApiV1MyFolders(
        body: CreateFolderRequest,
    ): CancelablePromise<UserFolderResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/my-folders',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1MyFoldersRoot(): CancelablePromise<UserFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-folders/root',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns ListUserFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1MyFoldersRootList(): CancelablePromise<ListUserFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-folders/root/list',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static deleteApiV1MyFolders(
        folderId: string,
    ): CancelablePromise<UserFolderResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/my-folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1MyFolders1(
        folderId: string,
    ): CancelablePromise<UserFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @param body
     * @returns UserFolderResponse OK
     * @throws ApiError
     */
    public static putApiV1MyFolders(
        folderId: string,
        body: UpdateFolderRequest,
    ): CancelablePromise<UserFolderResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/my-folders/{folder_id}',
            path: {
                'folder_id': folderId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param folderId
     * @returns ListUserFolderResponse OK
     * @throws ApiError
     */
    public static getApiV1MyFoldersList(
        folderId: string,
    ): CancelablePromise<ListUserFolderResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-folders/{folder_id}/list',
            path: {
                'folder_id': folderId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static getApiV1MyProfiles(): CancelablePromise<Array<SoundProfileResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-profiles',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static postApiV1MyProfiles(
        body: NewSoundProfileRequest,
    ): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/my-profiles',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param profileId
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static deleteApiV1MyProfiles(
        profileId: string,
    ): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/my-profiles/{profile_id}',
            path: {
                'profile_id': profileId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param profileId
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static getApiV1MyProfiles1(
        profileId: string,
    ): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-profiles/{profile_id}',
            path: {
                'profile_id': profileId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param profileId
     * @param body
     * @returns SoundProfileResponse OK
     * @throws ApiError
     */
    public static putApiV1MyProfiles(
        profileId: string,
        body: UpdateSoundProfileRequest,
    ): CancelablePromise<SoundProfileResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/my-profiles/{profile_id}',
            path: {
                'profile_id': profileId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @returns UserSoundResponse OK
     * @throws ApiError
     */
    public static getApiV1MySounds(): CancelablePromise<Array<UserSoundResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-sounds',
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param body
     * @returns UserSoundResponse OK
     * @throws ApiError
     */
    public static postApiV1MySounds(
        body: NewSoundRequest,
    ): CancelablePromise<UserSoundResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/my-sounds',
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @returns void
     * @throws ApiError
     */
    public static getApiV1MySoundsSoundData(
        soundId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-sounds/sound-data/{sound_id}',
            path: {
                'sound_id': soundId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @returns UserSoundResponse OK
     * @throws ApiError
     */
    public static deleteApiV1MySounds(
        soundId: string,
    ): CancelablePromise<UserSoundResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/my-sounds/{sound_id}',
            path: {
                'sound_id': soundId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @returns UserSoundResponse OK
     * @throws ApiError
     */
    public static getApiV1MySounds1(
        soundId: string,
    ): CancelablePromise<UserSoundResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/my-sounds/{sound_id}',
            path: {
                'sound_id': soundId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @param body
     * @returns UserSoundResponse OK
     * @throws ApiError
     */
    public static putApiV1MySounds(
        soundId: string,
        body: UpdateSoundRequest,
    ): CancelablePromise<UserSoundResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/my-sounds/{sound_id}',
            path: {
                'sound_id': soundId,
            },
            body: body,
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * @param soundId
     * @returns void
     * @throws ApiError
     */
    public static postApiV1MySoundsPlayViaDiscord(
        soundId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/my-sounds/{sound_id}/play-via-discord',
            path: {
                'sound_id': soundId,
            },
            errors: {
                400: `Bad Request`,
                500: `Internal Server Error`,
            },
        });
    }

}
