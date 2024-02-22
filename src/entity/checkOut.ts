import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";


@Entity()

export class CheckOut {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    userId:ObjectId | string


    @ManyToOne(() => User,(user)=>user.checkOuts) 
    @JoinColumn({ name: "userId" }) 
    user: User;

    @CreateDateColumn({ type: Date })
    timestamp: Date;
}