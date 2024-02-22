import { Request, Response } from "express";
import { getMongoManager } from "typeorm";
import { User } from "../entity/User";
import { Leave, LeaveStatus } from "../entity/leaves";
import { MyDataSource } from "../datasource";
import { ObjectId } from 'mongodb';

export const userLeaves = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const { startDate, endDate, reason } = req.body;

        // Parse startDate and endDate as Date objects
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Check if parsing was successful
        if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({ error: 'Invalid start date or end date format' });
        }
        

        // Calculate leave duration
        const leaveDays = Math.ceil((parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24));

        const userRepository = MyDataSource.getRepository(User);
        const user = await userRepository.findOne(currentUser.id);

        console.log(user);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure that the necessary properties are of type number
        const totalLeavesPerMonth: number = user.totalLeavesPerMonth || 0;
        const leavesTaken: number = typeof user.leavesTaken === 'number' ? user.leavesTaken : 0;
        // Check if there are enough leaves available
        if (totalLeavesPerMonth - leavesTaken < leaveDays) {
            return res.status(400).json({ error: 'Not enough leaves available' });
        }

        const leaveRepository = MyDataSource.getRepository(Leave);


        const newLeave = new Leave();
        newLeave.userId = currentUser.id;
        newLeave.startDate = new Date(startDate);
        newLeave.endDate = new Date(endDate);
        newLeave.reason = reason;
        newLeave.status = LeaveStatus.PENDING;

        // Save the new leave to the database
        await MyDataSource.manager.save(newLeave);

        res.status(201).json({ message: 'Leave added successfully!', data: newLeave });


        user.leavesTaken += leaveDays;
        await MyDataSource.manager.save(user);
    } catch (err) {
        console.error('Error during leave creation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const leaveHistory = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const leaveRepository = MyDataSource.getRepository(Leave);

        const leaveHistory = await leaveRepository.find({
            where: { userId: currentUser.id },
        });

        res.status(200).json({ leaveHistory });
    } catch (err) {
        console.error('Error retrieving leave history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};




export const approveLeave = async (req: Request, res: Response) => {
    try {
        const { leaveId } = req.params;
        const leaveRepository = MyDataSource.getRepository(Leave);

        await leaveRepository.update(leaveId, { status: LeaveStatus.APPROVED });

        res.status(200).json({ message: 'Leave approved successfully.' });
    } catch (err) {
        console.error('Error approving leave:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const rejectLeave = async (req: Request, res: Response) => {
    try {
        const { leaveId } = req.params;

        const leaveRepository = MyDataSource.getRepository(Leave);

        const leave = await leaveRepository.findOne({ where: { _id: new ObjectId(leaveId) } });
        console.log(leave);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        await leaveRepository.update(leaveId, { status: LeaveStatus.REJECTED });

        if (leave.status !== LeaveStatus.REJECTED) {
            const userRepository = MyDataSource.getRepository(User);
            const user = await userRepository.findOne({where:{ _id:new ObjectId( leave.userId )}});

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const leaveDuration = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24));
            const updatedLeave=user.leavesTaken -= leaveDuration;

            await MyDataSource.manager.update(
                User,
                {_id:new ObjectId( leave.userId )},
                {leavesTaken : updatedLeave}
                );
        }

        res.status(200).json({ message: 'Leave rejected successfully.' });
    } catch (err) {
        console.error('Error rejecting leave:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const allLeaves = async (req: Request, res: Response) => {
    try {
        const leaveRepository = MyDataSource.getRepository(Leave);

        const allLeaves = await leaveRepository.find({ relations: ['user'] });

        res.status(200).json({ allLeaves });
    } catch (err) {
        console.error('Error retrieving leave history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
