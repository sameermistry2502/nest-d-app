import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}