import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { CheckIn } from "./checkIn";
import { CheckOut } from "./checkOut";

@Entity()

export class User {

    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({  unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    token:string

    @Column()
    checkInId:ObjectId | string

    @OneToMany(() => CheckIn,(checkIn)=>checkIn.user) 
    @JoinColumn({ name: "checkInId" }) 
    checkIns:CheckIn;

    @Column()
    checkOutId:ObjectId | string

    @OneToMany(() => CheckIn,(checkIn)=>checkIn.user) 
    @JoinColumn({ name: "checkOutId" }) 
    checkOuts:CheckOut;

    @Column({type:"int",default:0})
    leavesTaken:number


    @Column({type:"int", nullable: false, default: 5 })
    totalLeavesPerMonth: number;
  

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}