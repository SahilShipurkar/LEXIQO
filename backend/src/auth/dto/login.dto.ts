import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6I...' })
    @IsNotEmpty()
    @IsString()
    token: string;
}
