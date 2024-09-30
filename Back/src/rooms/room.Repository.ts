import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Room } from "./room.entity";
import { Repository } from "typeorm";
import { RoomCategory } from "./roomCategory.entity";
import { RoomImg } from "./roomImg.entity";
import { CreateRoomDto } from "src/dtos/createRoom.dto";
import { Property } from "src/properties/property.entity";
import { ICategories } from "./roomCategory.entity";
import { IRoomState } from "./room.entity";

export class PartialRoomDto {
    capacity: number;
    roomCategory: ICategories;
    disponibility: IRoomState;
    price_per_day: number;
    room_number: number;
}

@Injectable()
export class RoomRepository{
    constructor(
        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,
        @InjectRepository(RoomImg)
        private readonly roomImgRepository: Repository<RoomImg>,
        @InjectRepository(Property)
        private readonly propertyRepository: Repository<Property>,
    ){}
    async addRoom(uuid: string, newRoom: CreateRoomDto):Promise<PartialRoomDto | null>{
        


        const foundProperty = await this.propertyRepository.findOneBy({uuid});
            if (!foundProperty) throw new NotFoundException('Propiedad no encontrada');

        const addRoom = new Room()
        
        Object.assign(addRoom, newRoom)
        addRoom.property = foundProperty;

        const savedRoom = await this.roomRepository.save(addRoom)   

        return {
            capacity: savedRoom.capacity,
            roomCategory: savedRoom.roomCategory,
            disponibility: savedRoom.disponibility,
            price_per_day: savedRoom.price_per_day,
            room_number: savedRoom.room_number,
        } as PartialRoomDto;
    }

}
