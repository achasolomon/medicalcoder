// routes/index.ts
import express from 'express';
import { authRouter } from './auth.routes';
import { cptCodeRouter } from './cptCode.routes';
import { encounterRouter } from './encounter.routes';
import { icdCodeRouter } from './icdCode.routes';
import {patientRouter} from './patients.routes'
import {ecounterRouter} from './encounter_diagnoses.routes'
import {procedureRouter} from './encounter_procedures.routes'
import {dashboardRouter} from './dashboard.routes';
import {healthRouter} from './health.routes';


const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/cpt-codes', cptCodeRouter);
mainRouter.use('/encounters', encounterRouter);
mainRouter.use('/icd-codes', icdCodeRouter);
mainRouter.use('/patients', patientRouter)
mainRouter.use('/diagnoses', ecounterRouter)
mainRouter.use('/procedures', procedureRouter)
mainRouter.use('/dashboard', dashboardRouter)
mainRouter.use('/health', healthRouter)



export default mainRouter;