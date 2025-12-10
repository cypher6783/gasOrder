import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { adminController } from '../controllers/admin.controller';

const router = Router();

// Protected admin routes
router.use(authenticate, authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Vendor management
router.get('/vendors', adminController.getAllVendors);
router.get('/vendors/pending', adminController.getPendingVendors);
router.patch('/vendors/:id/approve', adminController.approveVendor);
router.patch('/vendors/:id/reject', adminController.rejectVendor);
router.patch('/vendors/:id/suspend', adminController.suspendVendor);

// Customer management
router.get('/customers', adminController.getAllCustomers);
router.get('/customers/:id', adminController.getCustomerById);

// Disputes (placeholder for now)
router.get('/disputes', (req, res) => {
  res.json({ status: 'success', message: 'Get disputes endpoint' });
});

router.patch('/disputes/:id/resolve', (req, res) => {
  res.json({ status: 'success', message: 'Resolve dispute endpoint' });
});

export default router;
