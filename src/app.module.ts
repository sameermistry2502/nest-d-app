// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, UsersModule, UsersService],
  controllers: [],
  providers: [],
})
export class AppModule { }