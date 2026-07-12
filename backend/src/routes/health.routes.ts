import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     summary: Retrieve API health status
 *     description: Returns uptime, environment parameters, and package version.
 *     responses:
 *       200:
 *         description: Server is active and database/redis connects normally.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     uptime:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                     environment:
 *                       type: string
 *                     version:
 *                       type: string
 */
router.get('/', getHealth);

export default router;
