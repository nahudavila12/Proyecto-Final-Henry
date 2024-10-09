import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { CloudinaryService } from 'src/commons/cloudinary.service';
import { ProfileRepository } from 'src/profiles/profile.repository';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly profileRepository: ProfileRepository
    ) {}

    async getAllUsers(page: number, limit: number): Promise<User[]> {
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            throw new Error('Los valores de page y limit deben ser números');
        }

        const skip = (pageNumber - 1) * limitNumber;
        return this.userRepository.find({
            skip: skip,
            take: limitNumber,
        });
    }

    async addUser(newUser: CreateUserDto, file?: Express.Multer.File): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: newUser.email },
        });

        if (existingUser) {
            throw new ConflictException('El email ya está en uso');
        }

        try {
            const user = new User(); 
            Object.assign(user, newUser)

            const savedUser = await this.userRepository.save(user); 

            let imageUrl: string = ''; 
            if (file) {
                const uploadResult = await this.cloudinaryService.uploadImage(file);
                imageUrl = uploadResult.secure_url; 
            }

            const profile = await this.profileRepository.findOne({
                where: { user: savedUser },
            });

            if (profile) {
                profile.userIMG = imageUrl; 
                await this.profileRepository.save(profile);
            } else {

                const newProfile = await this.profileRepository.create({
                    user: savedUser,
                    userIMG: imageUrl,
                    user_name: savedUser.user_name,
                    email: savedUser.email,
                    phone: savedUser.phone,
                    country: savedUser.country,
                    address: savedUser.address,
                    password: savedUser.password,
                });
                await this.profileRepository.save(newProfile);
            }

            return savedUser; 
        } catch (error) {
            throw new InternalServerErrorException(
                'Error al agregar el usuario.',
                error.message
            );
        }
    }

    async findByEmail(email: string): Promise<User | undefined> {
        try {
            return await this.userRepository.findOne({
                where: { email },
            });
        } catch (error) {
            throw new InternalServerErrorException(
                'Error al buscar el usuario por email en el servicio.',
                error.message
            );
        }
    }

    // Nuevo método para actualizar la imagen del perfil
    async updateUserProfileImage(userUuid: string, userImageUrl: string): Promise<void> {
        const profile = await this.profileRepository.findOne({
            where: { user: { uuid: userUuid } },
        });

        if (!profile) {
            throw new NotFoundException('Perfil no encontrado para el usuario.');
        }

        profile.userIMG = userImageUrl;
        await this.profileRepository.save(profile);
    }

    async deleteUser(uuid: string): Promise<void> {
        try {
            const result = await this.userRepository.delete(uuid);
            if (result.affected === 0) {
                throw new NotFoundException('Usuario no encontrado');
            }
        } catch (error) {
            throw new InternalServerErrorException('Error al eliminar el usuario.', error.message);
        }
    }
    

    async bannUser(uuid: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: { uuid },
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        user.isBanned = true;
        await this.userRepository.save(user);
        
        return true; 
    }
    
}
