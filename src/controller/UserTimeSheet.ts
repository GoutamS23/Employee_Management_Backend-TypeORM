import { Request, Response } from 'express';
import { getConnection, getMongoManager } from 'typeorm';
import { User } from '../entity/User';
import { CheckIn } from '../entity/checkIn';
import { CheckOut } from '../entity/checkOut';
import { Leave } from '../entity/leaves';
import moment from 'moment';
import { ObjectId } from 'mongodb';

import { MyDataSource } from "../datasource";

export const generateTimesheet = async (req: Request, res: Response): Promise<Response> => {
    try {
        const uId: string = req.user.id;

        const userId = new ObjectId(uId);



        const userRepository = MyDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { _id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const checkInRepository = getMongoManager().getRepository(CheckIn);
        const checkIns = await checkInRepository.find({ where: { _id: userId } });
        console.log(checkIns);

        const checkOutRepository = getMongoManager().getRepository(CheckOut);
        const checkOuts = await checkOutRepository.find({ where: { _id: userId } });

        // Fetch leaves for the user that include today's date
        const today = new Date();
        const leavesToday = await getMongoManager().find(Leave, {
            where: {
                userId,
                startDate: { $lte: today },
                endDate: { $gte: today }
            }
        });

        // Check if the user is on leave for today
        const isOnLeaveToday = leavesToday.length > 0;

        if (!isOnLeaveToday) {
            if (checkIns.length !== checkOuts.length) {
                return res.status(400).json({ message: 'Mismatch in check-ins and check-outs' });
            }
        }

        // Fetch leaves for the user
        const leaves = await getMongoManager().find(Leave, {
            where: {
                userId,
                startDate: { $lte: today },
                endDate: { $gte: today }
            }
        });

        const leaveReason = leaves.length > 0 ? leaves[0].reason : 'NULL';

        let timesheetArray;

        if (checkIns.length === 0 && checkOuts.length === 0) {
            // User didn't check in and check out
            timesheetArray = [{
                checkIn: 'absent',
                checkout: 'absent',
                status: 'absent',
                workingHours: '',
                leaveReason
            }];
        } else {
            timesheetArray = checkIns.map((checkIn, index) => {
                const checkOut = checkOuts[index];

                if (!checkOut) {
                    return {
                        checkIn: checkIn.timestamp ? checkIn.timestamp.toString() : '',
                        checkout: '',
                        status: 'present',
                        workingHours: '',
                        leaveReason
                    };
                }

                const checkInTime = checkIn.timestamp ? checkIn.timestamp.toString() : '';
                const checkOutTime = checkOut.timestamp ? checkOut.timestamp.toString() : '';

                const status = checkIn && checkOut ? 'present' : 'absent';

                const diffMilliseconds = checkOut.timestamp.getTime() - checkIn.timestamp.getTime();
                const diffHours = diffMilliseconds / (1000 * 60 * 60);

                return {
                    checkIn: checkInTime,
                    checkout: checkOutTime,
                    status,
                    workingHours: diffHours.toFixed(2),
                    leaveReason: status === 'absent' ? leaveReason : 'NULL'
                };
            });
        }

        return res.status(200).json({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            timesheetArray
        });
    } catch (error) {
        console.error('Error generating timesheet:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const generateTimesheetByDate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const uId: string = req.user.id;
        const userId = new ObjectId(uId);
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Construct start and end dates for the month
        const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').toDate();
        const endDate = moment(startDate).endOf('month').toDate();

        if (startDate > new Date()) {
            return res.status(400).json({ message: 'Selected month is in the future' });
        }

        // Fetch user details
        const userRepository = MyDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { _id: userId } });


        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch check-ins for the month
        const checkInRepository = MyDataSource.getRepository(CheckIn);
        const checkIns = await getConnection().mongoManager.find(CheckIn,
            {
                relations: {
                    user: true
                },
                where: {
                    userId: uId,
                    timestamp: { $gte: startDate, $lte: endDate }
                }
            }
        );



        // Fetch check-outs for the month
        const checkOutRepository = MyDataSource.getRepository(CheckOut);
        
        const checkOuts = await getConnection().mongoManager.find(CheckOut, {
            relations: {
                user: true
            },
            where: {
                userId: uId,
                timestamp: { $gte: startDate, $lte: endDate }
            }
        });
        console.log(checkOuts)


        // Fetch leaves for the month
        const leaveRepository = MyDataSource.getRepository(Leave);
        const leaves = await getConnection().mongoManager.find(Leave, {
            where: {
                userId: userId,
                startDate: { $gte: startDate, $lte: endDate }
            }
        });




        // Construct timesheet array
        const leaveReason = leaves.length > 0 ? leaves[0].reason : 'NULL';

        let timesheetArray;

        if (checkIns.length === 0 && checkOuts.length === 0) {
            // User didn't check in and check out
            timesheetArray = [{
                checkIn: 'absent',
                checkout: 'absent',
                status: 'absent',
                workingHours: '',
                leaveReason
            }];
        } else {
            timesheetArray = checkIns.map((checkIn, index) => {
                const checkOut = checkOuts[index];

                if (!checkOut) {
                    return {
                        checkIn: checkIn.timestamp ? checkIn.timestamp.toISOString() : '',
                        checkout: '',
                        status: 'present',
                        workingHours: '',
                        leaveReason
                    };
                }

                const checkInTime = checkIn.timestamp ? checkIn.timestamp.toISOString() : '';
                const checkOutTime = checkOut.timestamp ? checkOut.timestamp.toISOString() : '';

                const status = checkIn && checkOut ? 'present' : 'absent';

                const diffMilliseconds = checkOut.timestamp.getTime() - checkIn.timestamp.getTime();
                const diffHours = diffMilliseconds / (1000 * 60 * 60);

                return {
                    checkIn: checkInTime,
                    checkout: checkOutTime,
                    status,
                    workingHours: diffHours.toFixed(2),
                    leaveReason: status === 'absent' ? leaveReason : 'NULL'
                };
            });
        }

        return res.status(200).json({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            timesheetArray,
        });
    } catch (error) {
        console.error('Error generating timesheet:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
