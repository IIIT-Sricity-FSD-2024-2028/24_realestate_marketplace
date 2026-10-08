import { UserResponseDto } from '../../users/dto/user-response.dto.js';
export declare class AuthResponseDto {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserResponseDto;
}
