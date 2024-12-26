import { Router } from 'express';
import * as encounterProcedureController from '../controllers/encounterProcedureController';

const procedureRouter = Router();

procedureRouter.post('/', encounterProcedureController.addProcedure);
procedureRouter.get('/', encounterProcedureController.listProceduresEncounter);
procedureRouter.get('/:id', encounterProcedureController.getProceduresByEncounterId);
procedureRouter.put('/:id', encounterProcedureController.updateProcedure);
procedureRouter.delete('/:id', encounterProcedureController.deleteProcedure);

export  {procedureRouter};
