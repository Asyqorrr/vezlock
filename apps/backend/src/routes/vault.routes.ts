import { Router } from 'express';
import * as vaultController from '../controllers/vault.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', vaultController.createEntry);
router.get('/', vaultController.getEntries);
router.delete('/:id', vaultController.deleteEntry);

export default router;
