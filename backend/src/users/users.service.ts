import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: any) {
        return this.prisma.user.create({
            data: createUserDto,
        });
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async findOne(id: string) {
        if (!id) return null;
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findOneByEmail(email: string) {
        if (!email) return null;
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findOneByUsername(username: string) {
        if (!username) return null;
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    // Phone number not in current schema, commenting out for now to prevent errors
    // async findOneByPhone(phoneNumber: string) {
    //     if (!phoneNumber) return null;
    //     return this.prisma.user.findFirst({
    //         where: { phoneNumber }, // Update schema if needed
    //     });
    // }

    async updateUser(id: string, updateData: any) {
        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
