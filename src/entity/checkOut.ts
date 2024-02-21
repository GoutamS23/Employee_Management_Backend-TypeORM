import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";


@Entity()

export class CheckOut {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId:ObjectId | string


    @ManyToOne(() => User,(user)=>user.checkOuts) // Assuming `checkIns` is the name of the property in User entity
    @JoinColumn({ name: "userId" }) // Specify the name of the foreign key column
    user: User;

    @CreateDateColumn({ type: Date })
    timestamp: Date;
}