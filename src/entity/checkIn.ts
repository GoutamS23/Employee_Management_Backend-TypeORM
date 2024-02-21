import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";


@Entity()

export class CheckIn {
    @ObjectIdColumn()
    _id: ObjectId


    @Column()
    userId:ObjectId | string


    @ManyToOne(() => User,(user)=>user.checkIns) // Assuming `checkIns` is the name of the property in User entity
    @JoinColumn({ name: "userId" }) // Specify the name of the foreign key column
    user: User;

 
    // @ManyToOne(()=>User,(user)=>user.checkIns)
    // user:User;

    @CreateDateColumn({ type: Date })
    timestamp: Date;
}

