import { Router } from 'express';
import * as encounterDiagnosisController from '../controllers/encounterDiagnosisController';

const ecounterRouter = Router();

ecounterRouter.post('/', encounterDiagnosisController.addDiagnosis);
ecounterRouter.get('/', encounterDiagnosisController.listDiagnosesEncounter);
ecounterRouter.get('/:id', encounterDiagnosisController.getDiagnosesByEncounterId);
ecounterRouter.put('/:id', encounterDiagnosisController.updateDiagnosis);
ecounterRouter.delete('/:id', encounterDiagnosisController.deleteDiagnosis);

export  {ecounterRouter};
