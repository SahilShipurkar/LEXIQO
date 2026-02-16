import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class SetUsernameDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers and underscores' })
    username: string;
}
