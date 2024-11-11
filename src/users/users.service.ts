// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            // Check if a user with the email already exists
            const existingUser = await this.userRepository.findOne({
                where: { email: createUserDto.email }
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

            // Create a new user instance
            const user = this.userRepository.create({
                name: createUserDto.name,
                email: createUserDto.email,
                password: hashedPassword,
                role: createUserDto.role,
            });

            // Save the user
            const savedUser = await this.userRepository.save(user);

            // Remove password from the response
            const { password, ...result } = savedUser;
            return result as User;

        } catch (error) {
            // Handle duplicate entry errors for MySQL
            if (error.code === 'ER_DUP_ENTRY') {
                throw new ConflictException('Email already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find({
            relations: ['role'],
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role'] // Exclude password
        });
        return users;
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role'],
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role'] // Exclude password
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async update(id: number, updateUserDto: any): Promise<User> {
        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.userRepository.save({
            ...user,
            ...updateUserDto,
        });

        const { password, ...result } = updatedUser;
        return result as User;
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.remove(user);
    }
}