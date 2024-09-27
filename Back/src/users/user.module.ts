import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity'; 
import { UserRepository } from './user.repository'; 
import { ProfileRepository } from 'src/profiles/profile.repository';
import { Profile } from 'src/profiles/profile.entity';
import { EmailModule } from 'src/email/email.module';


@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), EmailModule], 
  controllers: [UsersController],
  providers: [UserService, UserRepository, ProfileRepository],
  exports: [UserService]
})
export class UserModule {}  