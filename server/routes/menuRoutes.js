import express from 'express';
import { getMenuItems, getCategories } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/categories', getCategories);

export default router;
