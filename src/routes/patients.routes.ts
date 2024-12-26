import { Router } from 'express';
import * as patientController from '../controllers/patientController';

const patientRouter = Router();

// Define the routes
patientRouter.post('/', patientController.createPatient);  
patientRouter.get('/search', patientController.searchPatients);
patientRouter.get('/count', patientController.getTotalPatients);
patientRouter.get('/:id', patientController.getPatientById);  
patientRouter.get('/', patientController.listPatients); 
patientRouter.put('/:id', patientController.updatePatient);  
patientRouter.delete('/:id', patientController.deletePatient);
patientRouter.get('/details/:id', patientController.getPatientDetails);





export  {patientRouter};
