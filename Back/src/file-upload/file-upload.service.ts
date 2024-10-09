import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../commons/cloudinary.service';
import { FileUploadRepository } from './file-upload.repository';

@Injectable()
export class FileUploadService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly fileUploadRepository: FileUploadRepository,
    ) {}

    async uploadRoomImage(roomId: string, file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file);
        return this.fileUploadRepository.saveRoomImage(roomId, result.secure_url);
    }

    async uploadPropertyImage(propertyId: string, file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file);
        return this.fileUploadRepository.savePropertyImage(propertyId, result.secure_url);
    }

    async uploadUserImage(userId: string, file: Express.Multer.File) {
        const result = await this.cloudinaryService.uploadImage(file);
        // Guardar la URL de la imagen de perfil del usuario en la base de datos
        return this.fileUploadRepository.saveUserProfileImage(userId, result.secure_url);
    }
}
