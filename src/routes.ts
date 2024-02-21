import  express  from "express";
const router=express.Router();

import {login, signup} from './controller/Auth'
import { auth, isAdmin } from "./middlware/auth";
import { checkInUser, checkOutUser } from "./controller/UserActivity";
import { allLeaves, approveLeave, leaveHistory, rejectLeave, userLeaves } from "./controller/Leaves";
import { generateTimesheet, generateTimesheetByDate } from "./controller/UserTimeSheet";

router.post('/signup',signup);
router.post('/login',login);

router.post('/checkIn',auth,checkInUser);
router.post('/checkOut',auth,checkOutUser);

router.post('/apply-leave',auth,userLeaves);
router.get('/leaveHistory',auth,leaveHistory);

router.put('/approve-leave/:leaveId',auth, isAdmin, approveLeave);
router.put('/reject-leave/:leaveId',auth, isAdmin, rejectLeave);

router.get('/allLeaves',auth,isAdmin,allLeaves);

router.get('/user-timesheet',auth,generateTimesheet)
router.post('/user-timesheet',auth,generateTimesheetByDate)



export default router;