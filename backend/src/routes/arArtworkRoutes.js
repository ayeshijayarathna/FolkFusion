const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/arArtworkController');
const { protect, restrictTo } = require('../middleware/auth');

const sa = [protect, restrictTo('superAdmin')];

/*public*/
router.get('/',         ctrl.getPublished);
router.get('/:id',      ctrl.getById);

/*super admin*/
router.get   ('/admin/all',        ...sa, ctrl.getAll);
router.post  ('/admin/create',     ...sa, ctrl.create);
router.put   ('/admin/:id',        ...sa, ctrl.update);
router.patch ('/admin/:id/publish',...sa, ctrl.togglePublish);
router.delete('/admin/:id',        ...sa, ctrl.remove);
router.post  ('/admin/reorder',    ...sa, ctrl.reorder);

module.exports = router;