import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Schema } from "mongoose";

export enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

@Entity()
export class Leave {

    @ObjectIdColumn()
    _id: ObjectId

    @ManyToOne(() => User,(user)=>user._id)
    userId: User;

    @Column({nullable:false})
    reason:String

    @Column({type: Date})
    startDate:Date

    @Column({type:Date})
    endDate:Date

    @Column({
        type: "enum",
        enum: LeaveStatus,
        default: LeaveStatus.PENDING
    })
    status: LeaveStatus

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
