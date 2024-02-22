import { Request, Response } from "express";
import { getMongoManager } from "typeorm";
import { CheckIn } from "../entity/checkIn";
import { CheckOut } from "../entity/checkOut";
import { User } from "../entity/User";
import {MyDataSource} from '../datasource'

export const checkInUser = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const manager = getMongoManager();

        // Create a new CheckIn entity and associate it with the currentUser
        const checkInRepository=await MyDataSource.manager.find(CheckIn)
        console.log(checkInRepository)
        const newCheckIn = new CheckIn();
        newCheckIn.userId=currentUser.id
        newCheckIn.user = currentUser;

        await MyDataSource.manager.save(newCheckIn);


        const user = await MyDataSource.manager.findOne(User, { where: { email: currentUser.email } });
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }



        await MyDataSource.manager.update(
            User, // Entity you want to update
            { email: currentUser.email }, // Criteria to select entities to update
            { checkInId: newCheckIn._id,checkIns:newCheckIn }
        );

        res.status(201).json({ message: 'User checked in successfully' ,user});
    } catch (err) {
        console.error('Error during check-in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const checkOutUser = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const manager = getMongoManager();

        const user = await manager.findOne(User, { 
            relations:{checkIns:true  },
            where: { email: currentUser.email } 
        });
        if (!user || !user.checkIns ) {
            return res.status(400).json({ error: 'User has not checked in' });
        }

        const newCheckOut = new CheckOut();
        newCheckOut.userId=currentUser.id
        newCheckOut.user= currentUser;

        await manager.save(newCheckOut);

        await manager.update(
            User, // Entity you want to update
            { email: currentUser.email }, // Criteria to select entities to update
            { checkOutId: newCheckOut._id } // Update data
        );
        

        res.status(201).json({ message: 'User checked out successfully' });
    } catch (err) {
        console.error('Error during check-out:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
